'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';

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
    const firestore = getAdminFirestore();
    const contactsCollection = collection(firestore, 'contacts');
    
    // Create a new document for each submission, simplifying the logic.
    await addDoc(contactsCollection, {
        whatsappNumber: whatsappNumber,
        message: message,
        lastMessageAt: serverTimestamp(),
        from: 'user'
    });
    
    // The AI response will be triggered by Twilio calling our webhook.
    // We return a success state to the UI.
    return { sentTo: whatsappNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI Server Action:', error);
    return {
      sentTo: '',
      error: `Hubo un error al guardar tu consulta en la base de datos. Por favor, intenta de nuevo.`,
    };
  }
}
