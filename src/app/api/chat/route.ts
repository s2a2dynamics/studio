import { chat } from '@/ai/flows/chat';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const body = Object.fromEntries(formData.entries());

  const message = (body.Body as string) || '';

  if (!message) {
    return new Response('<Response><Message>No message body</Message></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
  }

  try {
    const { response } = await chat({ message });
    
    // Twilio expects a TwiML response
    const twiml = `<Response><Message>${response}</Message></Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Error in chat flow:', error);
    const twiml = `<Response><Message>Sorry, I encountered an error.</Message></Response>`;
    return new Response(twiml, {
        headers: { 'Content-Type': 'text/xml' },
    });
  }
}