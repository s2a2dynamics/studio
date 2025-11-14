'use server';

import { chat } from '@/ai/flows/chat';

export async function askAI(prevState: any, formData: FormData) {
  const message = formData.get('message') as string;

  if (!message) {
    return { response: '', error: 'El mensaje no puede estar vacío.' };
  }

  try {
    const { response } = await chat({ message });
    return { response, error: null };
  } catch (error: any) {
    console.error('Error calling AI flow:', error);
    return {
      response: '',
      error: 'Error al comunicarse con el asistente de IA.',
    };
  }
}
