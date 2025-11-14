'use server';

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
    // La única responsabilidad de esta acción es enviar el mensaje a Twilio
    // para iniciar la conversación a través del webhook.
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
    console.error('Error en la acción askAI al enviar a Twilio:', error);
    let detailedError = `Hubo un error al procesar tu solicitud.`;

    if (error.code === 21211) { // Código de error de Twilio para un número inválido
        detailedError = "El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.";
    } else {
        detailedError = `Ocurrió un error inesperado al contactar con Twilio: ${error.message}`;
    }

    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
