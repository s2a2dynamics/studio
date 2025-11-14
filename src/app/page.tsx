'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { askAI } from './actions';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando...' : 'Enviar y Recibir por WhatsApp'}
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(askAI, {
    response: '',
    sentTo: '',
    error: null,
  });

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
    if (state.response && !state.error) {
      toast({
        title: '¡Mensaje Enviado!',
        description: `La respuesta ha sido enviada a ${state.sentTo}`,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Asistente Virtual FVG</CardTitle>
          <CardDescription>
            Escribe tu consulta y recibe la respuesta directamente en tu
            WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Tu Número de WhatsApp</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="Ej: +584121234567 (incluye el código de país)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Tu Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Escribe aquí tu pregunta sobre la FVG..."
                required
                className="min-h-[100px]"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        {state.response && !state.error && (
          <>
            <Separator className="my-4" />
            <CardFooter className="flex flex-col items-start gap-4">
               <div>
                <h3 className="font-semibold">Respuesta Enviada a {state.sentTo}:</h3>
                <p className="text-sm text-gray-700">{state.response}</p>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </main>
  );
}
