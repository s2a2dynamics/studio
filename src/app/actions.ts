"use server";

import Twilio from "twilio";

export async function sendMessage(
  prevState: { success: boolean, message: string },
  formData: FormData
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    return {
      success: false,
      message: "Las credenciales de Twilio no están configuradas en el servidor.",
    };
  }

  const client = Twilio(accountSid, authToken);

  const to = formData.get("to") as string;
  const body = formData.get("body") as string;

  if (!to || !body) {
    return {
      success: false,
      message: "El número de destino y el mensaje son obligatorios.",
    };
  }

  try {
    await client.messages.create({
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${to}`,
      body: body,
    });
    return {
      success: true,
      message: "Mensaje enviado a WhatsApp correctamente.",
    };
  } catch (error: any) {
    console.error("Error sending message via Twilio:", error);
    return {
      success: false,
      message: `Error al enviar el mensaje: ${error.message}`,
    };
  }
}
