'use server';

import { addDoc, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc } from 'firebase/firestore';
import { firestore }from '@/lib/firebase-admin';


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
    // 1. Find or create the contact
    const contactsCollection = collection(firestore, 'contacts');
    const q = query(contactsCollection, where('whatsappNumber', '==', whatsappNumber));
    const querySnapshot = await getDocs(q);

    let contactId: string;

    if (querySnapshot.empty) {
      // Create new contact document if it doesn't exist
      const newContactRef = doc(contactsCollection);
      await setDoc(newContactRef, { 
        whatsappNumber: whatsappNumber,
        lastMessageAt: serverTimestamp(),
      });
      contactId = newContactRef.id;
    } else {
      // Contact already exists, get its ID
      const contactDoc = querySnapshot.docs[0];
      contactId = contactDoc.id;
      // Update lastMessageAt timestamp for existing contact
      await updateDoc(doc(firestore, 'contacts', contactId), { lastMessageAt: serverTimestamp() });
    }

    // 2. Add the user's message to the messages subcollection
    const messagesCollection = collection(firestore, 'contacts', contactId, 'messages');
    await addDoc(messagesCollection, {
        message: message,
        sentAt: serverTimestamp(),
        from: 'user'
    });
    
    // The AI response will be triggered by Twilio calling our webhook.
    // We return a success state to the UI.
    return { sentTo: whatsappNumber, error: null };

  } catch (error: any) {
    console.error('Error saving to Firestore:', error);
    // This error now correctly points to a database issue.
    return {
      sentTo: '',
      error: `Hubo un error al guardar tu consulta en la base de datos. Detalles: ${error.message}`,
    };
  }
}
