'use server';

import { chat } from '@/ai/flows/chat';

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;

  if (!message || !whatsappNumber) {
    return {
      response: '',
      whatsappNumber: '',
      error: 'El número de WhatsApp y el mensaje no pueden estar vacíos.',
    };
  }

  try {
    const { response } = await chat({ message });
    return { response, whatsappNumber, error: null };
  } catch (error: any) {
    console.error('Error calling AI flow:', error);
    return {
      response: '',
      whatsappNumber,
      error: 'Error al comunicarse con el asistente de IA.',
    };
  }
}
