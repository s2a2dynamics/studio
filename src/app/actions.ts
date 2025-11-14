'use server';

import { twiml } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

export async function sendMessage(prevState: any, formData: FormData) {
  const phoneNumber = formData.get('phoneNumber') as string;
  const message = formData.get('message') as string;

  if (!phoneNumber || !message) {
    return { success: false, message: 'El número de teléfono y el mensaje son obligatorios.' };
  }

  // Agrega el prefijo de WhatsApp si no está presente
  const formattedPhoneNumber = `whatsapp:${phoneNumber.startsWith('+') ? '' : '+'}${phoneNumber.replace(/\s+/g, '')}`;

  try {
    await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhoneNumber,
    });
    return { success: true, message: '¡Mensaje enviado! Revisa tu WhatsApp.' };
  } catch (error: any) {
    console.error('Error sending message via Twilio:', error);
    return { success: false, message: `Error al enviar el mensaje: ${error.message}` };
  }
}
