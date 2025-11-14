'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import twilio from 'twilio';

// Estas variables se leen desde el archivo .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const fromNumber = formData.get('whatsappNumber') as string;

  if (!message || !fromNumber) {
    return {
      sentTo: '',
      error: 'El número de WhatsApp y el mensaje no pueden estar vacíos.',
    };
  }

  // Verifica que las credenciales de Twilio estén configuradas en .env
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    const errorMsg = 'Las credenciales de Twilio no están configuradas correctamente en las variables de entorno.';
    console.error(errorMsg);
    return { sentTo: '', error: errorMsg };
  }

  try {
    // Inicializa Firebase en el servidor de forma robusta
    const { firestore } = initializeFirebase();
    
    // Guarda el mensaje inicial del usuario en la base de datos
    await addDoc(collection(firestore, 'contacts'), {
      whatsappNumber: fromNumber,
      message: message,
      lastMessageAt: serverTimestamp(),
      from: 'user',
    });

    // Envía el mensaje a Twilio para iniciar la conversación
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`, // Tu número de WhatsApp de Twilio
      to: `whatsapp:${fromNumber}`,       // El número del usuario
    });

    // La respuesta de la IA se gestiona en el webhook /api/chat
    // Aquí solo confirmamos que el mensaje inicial fue enviado.
    return { sentTo: fromNumber, error: null };

  } catch (error: any) {
    console.error('Error en la acción askAI:', error);
    let detailedError = `Hubo un error al procesar tu solicitud.`;

    if (error.code === 21211) { // Código de error de Twilio para un número inválido
        detailedError = "El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.";
    } else if (error.message && error.message.includes('firestore')) {
        detailedError = `Hubo un error al guardar tu consulta en la base de datos. Por favor, revisa la configuración.`;
    } else {
        detailedError = `Ocurrió un error inesperado: ${error.message}`;
    }

    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
