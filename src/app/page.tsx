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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendMessage } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Enviando...' : 'Iniciar Conversación'}
    </Button>
  );
}

export default function Home() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(sendMessage, {
    success: false,
    message: '',
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Éxito',
          description: state.message,
        });
        formRef.current?.reset();
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Asistente Virtual de WhatsApp</CardTitle>
          <CardDescription>
            Ingresa tu número de WhatsApp y tu consulta para iniciar una
            conversación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Tu número de WhatsApp</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+14155238886"
                required
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Tu Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Escribe aquí tu pregunta inicial..."
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
