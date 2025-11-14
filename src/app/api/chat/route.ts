import { chat } from "@/ai/flows/chat";
import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Initialize Firebase for server-side operations
// This check ensures we don't re-initialize on every action
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const message = params.get("Body");
    const from = params.get("From"); // e.g., "whatsapp:+14155238886"

    if (!message || !from) {
      return new Response("Missing Body or From", { status: 400 });
    }

    const whatsappNumber = from.replace('whatsapp:', '');

    // 1. Find the contact document to save the AI response
    const contactsCollection = collection(firestore, 'contacts');
    const q = query(contactsCollection, where('whatsappNumber', '==', whatsappNumber));
    const querySnapshot = await getDocs(q);
    
    // The contact should have been created by the initial form submission.
    // If not, we can't save the AI message, but we should still reply.
    if (querySnapshot.empty) {
       console.warn(`Webhook received message from unknown contact: ${whatsappNumber}. The initial form submission might have failed.`);
    }

    // 2. Process the message with the AI agent to get a response
    const { response: aiResponse } = await chat({ message });

    // 3. Save the AI's response to Firestore if the contact exists
    if (!querySnapshot.empty) {
      const contactDoc = querySnapshot.docs[0];
      const messagesCollection = collection(firestore, 'contacts', contactDoc.id, 'messages');
      await addDoc(messagesCollection, {
          message: aiResponse,
          sentAt: serverTimestamp(),
          from: 'ai'
      });
      // Also update the last message timestamp on the contact
      await updateDoc(doc(firestore, 'contacts', contactDoc.id), { lastMessageAt: serverTimestamp() });
    }

    // 4. Create the TwiML response to send the message back to the user
    const messagingResponse = new twiml.MessagingResponse();
    messagingResponse.message(aiResponse);

    return new NextResponse(messagingResponse.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });

  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    const messagingResponse = new twiml.MessagingResponse();
    messagingResponse.message("Lo siento, he encontrado un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
    
    return new NextResponse(messagingResponse.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
