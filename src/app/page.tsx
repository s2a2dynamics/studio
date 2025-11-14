"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/app/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialState = {
  response: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}

export default function Home() {
  const [state, formAction] = useActionState(sendMessage, initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: state.response },
      ]);
    }
  }, [state]);

  const handleFormAction = (formData: FormData) => {
    const message = formData.get("message") as string;
    if (message) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: message },
      ]);
      formAction(formData);
      formRef.current?.reset();
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-lg flex flex-col h-[80vh]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">AI Chat</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Chat with a Genkit-powered AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form
            ref={formRef}
            action={handleFormAction}
            className="flex w-full items-center space-x-2"
          >
            <Input
              name="message"
              placeholder="Type your message..."
              autoComplete="off"
            />
            <SubmitButton />
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}