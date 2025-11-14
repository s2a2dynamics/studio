import { chat } from "@/ai/flows/chat";
import { NextRequest, NextResponse } from "next/server";
import { twiml } from "twilio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const message = params.get("Body");
    const from = params.get("From");

    if (!message || !from) {
      return new Response("Missing message or from", { status: 400 });
    }
    
    const { response: aiResponse } = await chat({ message });
    
    const messagingResponse = new twiml.MessagingResponse();
    messagingResponse.message(aiResponse);

    return new NextResponse(messagingResponse.toString(), {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    const messagingResponse = new twiml.MessagingResponse();
    messagingResponse.message("Sorry, I encountered an error. Please try again.");
    return new NextResponse(messagingResponse.toString(), {
      status: 500,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}