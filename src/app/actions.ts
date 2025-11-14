'use server';

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const userPhoneNumber = process.env.USER_PHONE_NUMBER; // The number you registered with Twilio

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const fromNumber = formData.get('whatsappNumber') as string; // User's whatsapp number from form

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
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: `whatsapp:${userPhoneNumber}`, // Your Twilio WhatsApp number
      to: `whatsapp:${fromNumber}`,   // The user's number from the form
    });
    
    // We are simulating the conversation flow by sending the user's message to Twilio,
    // which will then trigger our webhook.
    return { sentTo: fromNumber, error: null };

  } catch (error: any) {
    console.error('Error in askAI Server Action:', error);
    // Provide a more specific error based on Twilio's feedback if available
    let detailedError = `Hubo un error al procesar tu solicitud. Código: ${error.code}. ${error.message}`;
    if (error.code === 21211) { // Example: Invalid 'To' Phone Number
        detailedError = "El número de WhatsApp proporcionado no es válido. Por favor, verifica e intenta de nuevo.";
    }
    return {
      sentTo: '',
      error: detailedError,
    };
  }
}
