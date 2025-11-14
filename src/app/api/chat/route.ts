import { chat } from "@/ai/flows/chat";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Inicializar Firebase para operaciones del lado del servidor
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

// Inicializar el cliente de Twilio con las credenciales del entorno
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

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

    // 1. Encontrar el documento del contacto para guardar la respuesta de la IA
    const contactsCollection = collection(firestore, 'contacts');
    // The number from Twilio doesn't include a '+', but our form does. Let's try both.
    const q = query(contactsCollection, where('whatsappNumber', 'in', [whatsappNumber, `+${whatsappNumber}`]));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
       console.warn(`Webhook received message from unknown contact: ${whatsappNumber}. The initial form submission might have failed or the number format is different.`);
    }

    // 2. Procesar el mensaje con el agente de IA para obtener una respuesta
    const { response: aiResponse } = await chat({ message });

    // 3. Guardar la respuesta de la IA en Firestore si el contacto existe
    if (!querySnapshot.empty) {
      const contactDoc = querySnapshot.docs[0];
      const messagesCollection = collection(firestore, 'contacts', contactDoc.id, 'messages');
      await addDoc(messagesCollection, {
          message: aiResponse,
          sentAt: serverTimestamp(),
          from: 'ai'
      });
      await updateDoc(doc(firestore, 'contacts', contactDoc.id), { lastMessageAt: serverTimestamp() });
    }

    // 4. Enviar la respuesta de vuelta al usuario usando el cliente de Twilio
    await client.messages.create({
      body: aiResponse,
      from: twilioPhoneNumber,
      to: from,
    });

    // 5. Devolver una respuesta vacía a Twilio para confirmar la recepción
    const twiml = new twilio.twiml.MessagingResponse();
    return new NextResponse(twiml.toString(), { 
        status: 200, 
        headers: { 'Content-Type': 'text/xml' } 
    });

  } catch (error: any) {
    console.error("Error processing Twilio webhook:", error);
    
    // En caso de error, es mejor devolver un error de servidor para que Twilio pueda reintentar si está configurado
    return new NextResponse("Error processing request", { status: 500 });
  }
}
