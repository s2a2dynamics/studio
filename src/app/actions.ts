"use server";

import { chat } from "@/ai/flows/chat";

export async function sendMessage(prevState: any, formData: FormData) {
  const message = formData.get("message") as string;
  if (!message) {
    return { response: "Please enter a message." };
  }
  try {
    const { response } = await chat({ message });
    return { response };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { response: "Sorry, I encountered an error." };
  }
}