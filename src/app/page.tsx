'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { askAI } from './actions';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando...' : 'Enviar Consulta'}
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(askAI, {
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
    if (state.sentTo && !state.error) {
      toast({
        title: '¡Consulta Guardada!',
        description: `Tu consulta ha sido guardada. La respuesta llegará a ${state.sentTo} en breve.`,
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
            Escribe tu consulta y tu número de WhatsApp. Recibirás la respuesta
            directamente en tu teléfono.
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
      </Card>
    </main>
  );
}