'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Send, LoaderCircle, CheckCircle } from 'lucide-react';
import { sendNotification, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <Send />
      )}
      <span>{pending ? 'Sending...' : 'Send Test Notification'}</span>
    </Button>
  );
}

export function NotifierForm() {
  const [state, formAction] = useFormState(sendNotification, initialState);
  const { toast } = useToast();

  useEffect(() => {
    // Show a toast only on failure, as per user guidelines
    if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Notification Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="w-full space-y-4">
      <div className="flex justify-center">
        <SubmitButton />
      </div>
      {state.message && state.success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
