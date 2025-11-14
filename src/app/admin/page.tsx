'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogoutButton } from '@/components/auth/logout-button';

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
    return timestamp.toDate().toLocaleString();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Panel de Administración</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Consultas Recibidas</CardTitle>
            <CardDescription>Aquí puedes ver todos los mensajes enviados por los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Cargando conversaciones...</p>}
            {error && <p className="text-red-500">Error al cargar las conversaciones: {error.message}</p>}
            {!isLoading && !conversations?.length && <p>No hay conversaciones para mostrar.</p>}
            {conversations && conversations.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Número de WhatsApp</TableHead>
                      <TableHead>Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((convo) => (
                      <TableRow key={convo.id}>
                        <TableCell>{formatDate(convo.createdAt)}</TableCell>
                        <TableCell>{convo.whatsappNumber}</TableCell>
                        <TableCell>{convo.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
