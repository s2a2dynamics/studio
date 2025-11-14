'use server';

import { z } from 'zod';

const schema = z.object({
  // No fields needed for this simple trigger
});

export type FormState = {
  success: boolean;
  message: string;
};

export async function sendNotification(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = schema.safeParse({});

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }
  
  // Securely access credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const toPhoneNumber = process.env.TWILIO_TO_PHONE_NUMBER;
  const fromPhoneNumber = process.env.TWILIO_FROM_PHONE_NUMBER;

  if (!accountSid || !authToken || !toPhoneNumber || !fromPhoneNumber) {
    console.error('Twilio environment variables are not set.');
    return {
      success: false,
      message: 'Server configuration error. Please check environment variables.',
    };
  }

  console.log('--- Triggering Twilio API Call Simulation ---');
  console.log(`Account SID used: ${accountSid.substring(0, 5)}...`);
  console.log('Sending message to:', toPhoneNumber);
  console.log('Sending message from:', fromPhoneNumber);
  console.log('-------------------------------------------');

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real application, you would implement the Twilio API call here.
    // Example using the 'twilio' library:
    //
    // import twilio from 'twilio';
    // const client = twilio(accountSid, authToken);
    //
    // await client.messages.create({
    //   body: 'Hello! This is a test notification from your Firebase app.',
    //   from: `whatsapp:${fromPhoneNumber}`,
    //   to: `whatsapp:${toPhoneNumber}`
    // });
    
    // Simulating a successful API call
    console.log('Successfully simulated sending WhatsApp message via Twilio.');

    return {
      success: true,
      message: 'Test notification has been sent successfully!',
    };
  } catch (error) {
    console.error('Twilio API call simulation failed:', error);
    return {
      success: false,
      message: 'Failed to send notification. Check server logs for details.',
    };
  }
}
