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

    // Always create a new document for each message
    await addDoc(contactsRef, {
      whatsappNumber: fromNumber,
      message: message,
      lastMessageAt: serverTimestamp(),
      from: 'user',
    });

    // Send message via Twilio
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${fromNumber}`,
    });

    return { sentTo: fromNumber, error: null };
  } catch (error: any) {
    console.error('Error en la acción askAI:', error);
    let detailedError = 'Hubo un error al procesar tu solicitud.';

    if (
      error.code === 'auth/network-request-failed' ||
      error.message.includes('firestore')
    ) {
      detailedError =
        'Hubo un error al guardar tu consulta en la base de datos. Por favor, revisa la configuración de Firestore y las reglas de seguridad.';
    } else if (error.code === 21211) {
      detailedError =
        'El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.';
    } else {
      detailedError = `Ocurrió un error inesperado: ${error.message}`;
    }

    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
