'use server';

import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import twilio from 'twilio';
import 'dotenv/config';
import { chat } from '@/ai/flows/chat';

// Robust server-side Firebase initialization
function getFirestoreInstance() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getFirestore(getApp());
}

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

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    const errorMsg =
      'Las credenciales de Twilio no están configuradas correctamente en las variables de entorno.';
    console.error(errorMsg);
    return { sentTo: '', error: errorMsg };
  }

  try {
    const firestore = getFirestoreInstance();
    const contactsRef = collection(firestore, 'contacts');

    // 1. Save user's message to Firestore
    await addDoc(contactsRef, {
      whatsappNumber: fromNumber,
      message: message,
      lastMessageAt: serverTimestamp(),
      from: 'user',
    });

    // 2. Get AI response
    const { response: aiResponse } = await chat({ message });
    
    // (Optional) Save AI response to Firestore
    await addDoc(contactsRef, {
      whatsappNumber: fromNumber,
      message: aiResponse,
      lastMessageAt: serverTimestamp(),
      from: 'ai',
    });


    // 3. Send AI response via Twilio
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: aiResponse,
      from: twilioPhoneNumber,
      to: `whatsapp:${fromNumber}`,
    });

    return { sentTo: fromNumber, error: null };
  } catch (error: any) {
    console.error('Error en la acción askAI:', error);
    let detailedError = 'Hubo un error al procesar tu solicitud.';

    if (error.code && error.code.includes('firestore')) {
      detailedError =
        'Hubo un error al guardar tu consulta en la base de datos. Por favor, revisa la configuración de Firestore y las reglas de seguridad.';
    } else if (error.code === 21614) { // Twilio error for "To" number not opted-in for Sandbox
       detailedError =
        `El número ${fromNumber} no se ha unido al Sandbox de Twilio. Envía un mensaje de WhatsApp desde tu teléfono al número ${twilioPhoneNumber} para unirte y poder recibir respuestas.`;
    } else if (error.code === 21211) { // Twilio error for invalid 'To' number
      detailedError =
        'El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.';
    } else if (error.code === 20003) { // Auth error
      detailedError = 'Error de autenticación con Twilio. Verifica tu Account SID y Auth Token.';
    } else {
      detailedError = `Ocurrió un error inesperado: ${error.message}`;
    }

    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
