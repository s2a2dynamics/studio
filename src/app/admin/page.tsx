'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogoutButton } from '@/components/auth/logout-button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Conversation = {
  id: string;
  whatsappNumber: string;
  message: string;
  createdAt: Timestamp;
};

function AdminDashboard() {
  const firestore = useFirestore();
  const conversationsQuery = useMemoFirebase(
    () => query(collection(firestore, 'conversations'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: conversations, isLoading, error } = useCollection<Conversation>(conversationsQuery);

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
              Aquí puedes ver todos los mensajes enviados por los usuarios a través del asistente virtual.
              <Badge variant="outline" className="ml-2">
                {conversations?.length ?? 0} {conversations?.length === 1 ? 'Consulta' : 'Consultas'}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="border rounded-lg">
                <ScrollArea className="h-[65vh]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[180px]">Fecha</TableHead>
                        <TableHead className="w-[200px]">Número de WhatsApp</TableHead>
                        <TableHead>Mensaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            Cargando conversaciones...
                          </TableCell>
                        </TableRow>
                      )}
                      {error && (
                         <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center text-red-500">
                             Error al cargar las conversaciones: {error.message}
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLoading && !conversations?.length && (
                         <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No hay conversaciones para mostrar.
                          </TableCell>
                        </TableRow>
                      )}
                      {conversations?.map((convo) => (
                        <TableRow key={convo.id}>
                          <TableCell className="font-medium">{formatDate(convo.createdAt)}</TableCell>
                          <TableCell>{convo.whatsappNumber}</TableCell>
                          <TableCell className="whitespace-pre-wrap">{convo.message}</TableCell>
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
