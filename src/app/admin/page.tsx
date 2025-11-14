'use client';

import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogoutButton } from '@/components/auth/logout-button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Contact = {
  id: string;
  whatsappNumber: string;
  message: string;
  lastMessageAt: Timestamp;
  from: 'user' | 'ai';
};

function AdminDashboard() {
  const firestore = useFirestore();
  const contactsQuery = useMemoFirebase(
    () => query(collection(firestore, 'contacts'), orderBy('lastMessageAt', 'desc')),
    [firestore]
  );
  const { data: contacts, isLoading, error } = useCollection<Contact>(contactsQuery);

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
     <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <div className="ml-auto">
         <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas Recibidas</CardTitle>
            <CardDescription>
              Aquí puedes ver todos los mensajes enviados a través del formulario.
              <Badge variant="outline" className="ml-2">
                {contacts?.length ?? 0} {contacts?.length === 1 ? 'Consulta' : 'Consultas'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="border rounded-lg">
                <ScrollArea className="h-[65vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[200px]">Número de WhatsApp</TableHead>
                        <TableHead>Mensaje del Usuario</TableHead>
                        <TableHead className="text-right">Fecha de Envío</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            Cargando consultas...
                          </TableCell>
                        </TableRow>
                      )}
                      {error && (
                          <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-red-500">
                              Error al cargar las consultas: {error.message}
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && !contacts?.length && (
                          <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No hay consultas para mostrar.
                          </TableCell>
                        </TableRow>
                      )}
                      {contacts?.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.whatsappNumber}</TableCell>
                          <TableCell className='whitespace-pre-wrap max-w-lg'>{contact.message}</TableCell>
                          <TableCell className="text-right">{formatDate(contact.lastMessageAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
