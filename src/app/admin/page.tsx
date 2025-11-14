'use client';

import { useState } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogoutButton } from '@/components/auth/logout-button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Contact = {
  id: string;
  whatsappNumber: string;
  lastMessageAt: Timestamp;
};

type Message = {
  id: string;
  message: string;
  sentAt: Timestamp;
  from: 'user' | 'ai';
}

function MessagesView({ contact, onBack }: { contact: Contact, onBack: () => void }) {
  const firestore = useFirestore();
  const messagesQuery = useMemoFirebase(
    () => query(collection(firestore, 'contacts', contact.id, 'messages'), orderBy('sentAt', 'asc')),
    [firestore, contact.id]
  );
  const { data: messages, isLoading, error } = useCollection<Message>(messagesQuery);

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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Conversación con {contact.whatsappNumber}</CardTitle>
            <CardDescription>
              Historial de mensajes ordenados cronológicamente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[65vh] border rounded-lg p-4">
          <div className="space-y-4">
            {isLoading && <p className="text-center">Cargando mensajes...</p>}
            {error && <p className="text-center text-red-500">Error al cargar mensajes: {error.message}</p>}
            {!isLoading && !messages?.length && <p className="text-center">No hay mensajes para mostrar.</p>}
            {messages?.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-md rounded-lg p-3 ${msg.from === 'user' ? 'bg-primary/80 text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{formatDate(msg.sentAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


function ContactsList({ onSelectContact }: { onSelectContact: (contact: Contact) => void }) {
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
     <Card>
      <CardHeader>
        <CardTitle>Contactos</CardTitle>
        <CardDescription>
          Aquí puedes ver todos los contactos que han interactuado con el asistente.
          <Badge variant="outline" className="ml-2">
            {contacts?.length ?? 0} {contacts?.length === 1 ? 'Contacto' : 'Contactos'}
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
                    <TableHead>Último Mensaje</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Cargando contactos...
                      </TableCell>
                    </TableRow>
                  )}
                  {error && (
                      <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-red-500">
                          Error al cargar los contactos: {error.message}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !contacts?.length && (
                      <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No hay contactos para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                  {contacts?.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.whatsappNumber}</TableCell>
                      <TableCell>{formatDate(contact.lastMessageAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => onSelectContact(contact)}>
                          <MessageCircle className="h-4 w-4 mr-2"/>
                          Ver Mensajes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
      </CardContent>
    </Card>
  );
}


function AdminDashboard() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  if (selectedContact) {
    return <MessagesView contact={selectedContact} onBack={() => setSelectedContact(null)} />
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <div className="ml-auto">
         <LogoutButton />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <ContactsList onSelectContact={setSelectedContact} />
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
