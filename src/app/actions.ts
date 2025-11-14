'use server';

import { chat } from '@/ai/flows/chat';
import { initializeFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Twilio } from 'twilio';

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const twilioPhoneNumber = '+14155238886';

  if (!message || !whatsappNumber) {
    return {
      response: '',
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
    const { firestore } = initializeFirebase();
    const conversationsCollection = collection(firestore, 'conversations');
    await addDoc(conversationsCollection, {
      whatsappNumber: whatsappNumber,
      message: message,
      createdAt: serverTimestamp(),
    });


    return { response, sentTo: whatsappNumber, error: null };
  } catch (error: any) {
    console.error('Error in askAI action:', error);
    let errorMessage = 'Hubo un error al procesar tu solicitud.';

    // Check if it's a Twilio error and provide a more specific message
    if (error.code) { // Twilio errors usually have a 'code' property
        errorMessage = `Error de Twilio: ${error.message}. Por favor, verifica que el número de teléfono sea válido y esté en formato internacional (ej: +584121234567).`;
    }

    return {
      response: '',
      sentTo: '',
      error: errorMessage,
    };
  }
}
