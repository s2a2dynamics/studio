
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-accent">
              <MessageSquare className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline">
              Asistente Virtual
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-base text-muted-foreground">
              Gracias por visitar. Este servicio impulsa a nuestro asistente de chat inteligente.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Puedes interactuar con nuestro asistente a través de WhatsApp.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
