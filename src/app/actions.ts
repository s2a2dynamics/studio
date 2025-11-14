'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

// This action is now only responsible for saving the incoming message to Firestore.
// The AI response and Twilio reply are handled by the /api/chat webhook.
export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;

  if (!message || !whatsappNumber) {
    return {
      sentTo: '',
      error: 'El número de WhatsApp y el mensaje no pueden estar vacíos.',
    };
  }

  try {
    // Save contact and message to Firestore
    const contactsCollection = collection(firestore, 'contacts');
    const q = query(contactsCollection, where('whatsappNumber', '==', whatsappNumber));
    const querySnapshot = await getDocs(q);

    let contactId: string;

    if (querySnapshot.empty) {
      // Create new contact
      const newContactRef = doc(contactsCollection);
      await setDoc(newContactRef, { 
        whatsappNumber: whatsappNumber,
        lastMessageAt: serverTimestamp(),
      });
      contactId = newContactRef.id;
    } else {
      // Contact exists
      const contactDoc = querySnapshot.docs[0];
      contactId = contactDoc.id;
      // Update lastMessageAt timestamp
      await updateDoc(doc(firestore, 'contacts', contactId), { lastMessageAt: serverTimestamp() });
    }

    // Add user's message to messages subcollection
    const messagesCollection = collection(firestore, 'contacts', contactId, 'messages');
    await addDoc(messagesCollection, {
        message: message,
        sentAt: serverTimestamp(),
        from: 'user'
    });
    
    // The AI response will be triggered by Twilio calling our webhook.
    // We simulate a successful submission here.
    return { sentTo: whatsappNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI action (saving to Firestore):', error);
    // This error is now more likely to be a Firestore permission error
    // if rules are misconfigured.
    return {
      sentTo: '',
      error: 'Hubo un error al guardar tu consulta en la base de datos. Por favor, revisa los permisos de Firestore.',
    };
  }
}
