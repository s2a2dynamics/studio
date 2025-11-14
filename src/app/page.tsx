
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface FormState {
  success: boolean;
  message: string;
}

const initialState: FormState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Enviando..." : "Iniciar Conversación en WhatsApp"}
      <Send className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function Home() {
  const [state, formAction] = useActionState(sendMessage, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Éxito" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>¡Acción Requerida!</AlertTitle>
          <AlertDescription>
            Para recibir respuestas en WhatsApp, configura tu Webhook en Twilio.
            Usa la siguiente URL en el campo 'WHEN A MESSAGE COMES IN':
            <pre className="mt-2 rounded-md bg-muted p-2 text-sm">
              [URL de tu app desplegada]<strong>/api/chat</strong>
            </pre>
          </AlertDescription>
        </Alert>

        <Card className="w-full shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-accent">
              <MessageSquare className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-headline">
              Probar Agente de WhatsApp
            </CardTitle>
            <CardDescription>
              Usa este formulario para enviar un primer mensaje desde tu número de Twilio a un destinatario.
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">Enviar a (Nº de WhatsApp con código de país)</Label>
                <Input
                  id="to"
                  name="to"
                  placeholder="Ej: +14155238886"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Mensaje</Label>
                <Textarea
                  id="body"
                  name="body"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
