import { chat } from "@/ai/flows/chat";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Initialize the Twilio client with credentials from the environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error("Twilio credentials are not configured in environment variables.");
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Lo siento, el servicio de mensajería no está configurado correctamente.`);
    return new NextResponse(twiml.toString(), { 
        status: 500, 
        headers: { 'Content-Type': 'text/xml' } 
    });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const message = params.get("Body");
    const from = params.get("From"); // e.g., "whatsapp:+14155238886"

    if (!message || !from) {
      return new Response("Missing Body or From", { status: 400 });
    }
    
    // 1. Process the message with the AI agent to get a response
    const { response: aiResponse } = await chat({ message });

    // 2. Send the response back to the user using the Twilio client
    await client.messages.create({
      body: aiResponse,
      from: twilioPhoneNumber,
      to: from,
    });

    // 3. Return an empty response to Twilio to acknowledge receipt
    const twiml = new twilio.twiml.MessagingResponse();
    return new NextResponse(twiml.toString(), { 
        status: 200, 
        headers: { 'Content-Type': 'text/xml' } 
    });

  } catch (error: any) {
    console.error("Error processing Twilio webhook:", error);
    
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Lo siento, ocurrió un error al procesar tu solicitud: ${error.message}`);
    return new NextResponse(twiml.toString(), { 
        status: 500, 
        headers: { 'Content-Type': 'text/xml' } 
    });
  }
}
