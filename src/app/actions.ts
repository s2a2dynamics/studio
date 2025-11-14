'use server';

import { chat } from '@/ai/flows/chat';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Twilio } from 'twilio';

// Initialize Firebase Admin SDK for server-side operations
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const firestore = getFirestore();

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const twilioPhoneNumber = '+14155238886';

  if (!message || !whatsappNumber) {
    return {
      sentTo: '',
      error: 'El número de WhatsApp y el mensaje no pueden estar vacíos.',
    };
  }

  try {
    // 1. Get AI response
    const { response } = await chat({ message });

    // 2. Send response via Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = new Twilio(accountSid, authToken);

    await client.messages.create({
      body: response,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${whatsappNumber}`,
    });
    
    // 3. Save conversation to Firestore
    const conversationsCollection = collection(firestore, 'conversations');
    await addDoc(conversationsCollection, {
        whatsappNumber: whatsappNumber,
        message: message,
        createdAt: serverTimestamp(),
    });

    return { sentTo: whatsappNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI action:', error);
    let errorMessage = 'Hubo un error al procesar tu solicitud.';

    if (error.code && error.message) {
        errorMessage = `Error de Twilio: ${error.message}. Por favor, verifica que el número de teléfono sea válido y esté en formato internacional (ej: +584121234567).`;
    }

    return {
      sentTo: '',
      error: errorMessage,
    };
  }
}
