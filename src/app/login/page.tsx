'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (error: any) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede al panel de administración.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full mt-6">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿No tienes un usuario?</AccordionTrigger>
            <AccordionContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Creación de Usuario Administrador</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 text-sm">
                    <p>Para acceder al panel, debes crear un usuario manualmente en la Consola de Firebase:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Ve a <strong>Build &gt; Authentication</strong> en tu proyecto de Firebase.</li>
                      <li>En la pestaña <strong>Sign-in method</strong>, activa el proveedor <strong>Correo electrónico/Contraseña</strong>.</li>
                      <li>Ve a la pestaña <strong>Users</strong> y haz clic en <strong>Add user</strong> para crear tu cuenta de administrador.</li>
                      <li>Usa esas credenciales para iniciar sesión aquí.</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
