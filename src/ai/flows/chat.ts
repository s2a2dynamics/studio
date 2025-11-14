'use server';
/**
 * @fileOverview A chat flow that uses Genkit to generate responses.
 *
 * - chat - A function that handles the chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { KNOWLEDGE_BASE } from '@/ai/knowledge';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI response'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: z.object({
    message: ChatInputSchema.shape.message,
    knowledgeBase: z.string().describe('The knowledge base to use'),
  }) },
  output: { schema: ChatOutputSchema },
  prompt: `You are a friendly and helpful virtual assistant for the Federación Venezolana de Golf (FVG).

Your goal is to have a natural, conversational interaction with the user.
Be proactive, engaging, and provide helpful and concise information based on the provided knowledge base.
Do not mention that you are an AI.

Use the following knowledge base to answer user questions:
---
{{{knowledgeBase}}}
---

Directly answer the user's question.

User message: {{{message}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ ...input, knowledgeBase: KNOWLEDGE_BASE });
    return output!;
  }
);
