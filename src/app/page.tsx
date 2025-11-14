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
      {pending ? 'Enviando...' : 'Enviar Mensaje'}
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(askAI, {
    response: '',
    whatsappNumber: '',
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
  }, [state, toast]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Asistente Virtual</CardTitle>
          <CardDescription>
            Escribe tu consulta para iniciar una conversación con nuestro
            asistente de IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">Tu Número de WhatsApp</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                placeholder="Ej: +1234567890"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Tu Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Escribe aquí tu pregunta..."
                required
                className="min-h-[100px]"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        {state.response && (
          <>
            <Separator className="my-4" />
            <CardFooter className="flex flex-col items-start gap-4">
              <div>
                <h3 className="font-semibold">Número de WhatsApp:</h3>
                <p className="text-sm text-gray-700">{state.whatsappNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold">Respuesta de la IA:</h3>
                <p className="text-sm text-gray-700">{state.response}</p>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </main>
  );
}
