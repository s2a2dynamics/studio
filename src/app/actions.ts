'use server';

import { chat } from '@/ai/flows/chat';
import { initializeFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Twilio } from 'twilio';

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

    // 3. Save conversation to Firestore without blocking
    const { firestore } = initializeFirebase();
    const conversationsCollection = collection(firestore, 'conversations');
    
    // Use the non-blocking function. This will not throw an error that stops the execution.
    // Permission errors will be handled by the global error listener.
    addDocumentNonBlocking(conversationsCollection, {
      whatsappNumber: whatsappNumber,
      message: message,
      createdAt: serverTimestamp(),
    });

    // Since the operation is non-blocking, we return success immediately.
    return { sentTo: whatsappNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI action:', error);
    let errorMessage = 'Hubo un error al procesar tu solicitud.';

    // Check if it's a Twilio error and provide a more specific message
    if (error.code) { // Twilio errors usually have a 'code' property
      errorMessage = `Error de Twilio: ${error.message}. Por favor, verifica que el número de teléfono sea válido y esté en formato internacional (ej: +584121234567).`;
    } else if (error.message.includes('permission-denied')) {
        errorMessage = 'Error de base de datos: Permiso denegado. Contacta al administrador.'
    }


    return {
      sentTo: '',
      error: errorMessage,
    };
  }
}
