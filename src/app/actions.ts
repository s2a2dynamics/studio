'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const userPhoneNumber = process.env.USER_PHONE_NUMBER;

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const fromNumber = formData.get('whatsappNumber') as string;

  if (!message || !fromNumber) {
    return {
      sentTo: '',
      error: 'El número de WhatsApp y el mensaje no pueden estar vacíos.',
    };
  }
  
  if (!accountSid || !authToken || !twilioPhoneNumber || !userPhoneNumber) {
    const errorMsg = 'Las credenciales de Twilio no están configuradas correctamente en las variables de entorno.';
    console.error(errorMsg);
    return { sentTo: '', error: errorMsg };
  }

  try {
    // 1. Save the user's initial message to Firestore.
    const firestore = getAdminFirestore();
    await addDoc(collection(firestore, 'contacts'), {
      whatsappNumber: fromNumber,
      message: message,
      lastMessageAt: serverTimestamp(),
      from: 'user',
    });

    // 2. Send the message via Twilio to trigger the webhook.
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`, // Your Twilio WhatsApp number
      to: `whatsapp:${fromNumber}`, // The user's number from the form
    });
    
    // We are simulating the conversation flow by sending the user's message to Twilio,
    // which will then trigger our webhook. The actual AI response happens in the webhook.
    return { sentTo: fromNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI Server Action:', error);
    let detailedError = `Hubo un error al procesar tu solicitud.`;

    if (error.code === 'auth/invalid-credential') {
      detailedError = "Error de autenticación con Firebase. Revisa las credenciales del servidor.";
    } else if (error.code === 7) { // Firestore permission denied
        detailedError = "Permiso denegado por Firestore. Revisa las reglas de seguridad.";
    } else if (error.code === 21211) { // Twilio Invalid 'To' Phone Number
        detailedError = "El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.";
    } else {
        detailedError = `Ocurrió un error inesperado: ${error.message}`;
    }

    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
