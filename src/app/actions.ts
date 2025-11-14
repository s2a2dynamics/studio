'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp, updateDoc, addDoc } from 'firebase/firestore';

// Initialize Firebase for server-side operations
// This check ensures we don't re-initialize on every action
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
    console.error('Error in askAI action (saving to Firestore):', error);
    // This error indicates a problem with the Firestore operation itself.
    return {
      sentTo: '',
      error: 'Hubo un error al guardar tu consulta en la base de datos. Por favor, revisa los permisos de Firestore.',
    };
  }
}
