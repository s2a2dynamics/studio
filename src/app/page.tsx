"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Zap, KeyRound } from "lucide-react";

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}


export default function Home() {

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
      <Card className="w-full shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <svg
                className="h-8 w-8 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 14h.01" />
                <path d="M12.5 21.9A9 9 0 0 1 3.1 12.5a9 9 0 0 1 9.4-9.4 9.4 9.4 0 0 1 6.5 2.5" />
                <path d="M18 10V4.5" />
                <path d="M21 7.5h-6" />
              </svg>
          </div>
          <CardTitle className="text-3xl font-headline">
            Agente de Chat de Twilio
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Este es un backend para un agente de chat de WhatsApp usando Twilio y Genkit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Webhook"
              description="Un endpoint de API público recibe los mensajes de Twilio."
            />
            <FeatureCard
              icon={<KeyRound className="h-6 w-6" />}
              title="Seguro"
              description="Tu API Key de Gemini se gestiona de forma segura mediante variables de entorno."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="IA Conversacional"
              description="Genkit y los modelos de Google generan respuestas de chat."
            />
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Para empezar, configura tu webhook de Twilio Sandbox para WhatsApp para que apunte a la URL de tu API. Una vez desplegada, tu URL será:
            </p>
            <p className="text-sm font-medium mt-2 bg-muted p-2 rounded-md">/api/chat</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}