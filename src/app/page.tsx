"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="w-full shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-accent">
              <MessageSquare className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline">
              Asistente Virtual de WhatsApp
            </CardTitle>
            <CardDescription>
              Este servicio está activo y listo para responder en WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Para interactuar con el asistente, envía un mensaje al número de
              WhatsApp asociado con nuestro servicio de Twilio.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
