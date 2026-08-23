"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Inbox, MessageCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Ticket, TicketPriority, TicketStatus } from "@/lib/tickets/mock-data";

const priorityMeta: Record<TicketPriority, { label: string; variant: "warning" | "info" | "neutral" }> = {
  high: { label: "Alta", variant: "warning" },
  medium: { label: "Media", variant: "info" },
  low: { label: "Baja", variant: "neutral" },
};

const statusMeta: Record<TicketStatus, { label: string; variant: "warning" | "success" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  in_progress: { label: "En curso", variant: "success" },
};

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function TicketCards({ tickets }: { tickets: Ticket[] }) {
  return (
    <ul className="space-y-3 md:hidden">
      {tickets.map((ticket) => {
        const priority = priorityMeta[ticket.priority];
        const status = statusMeta[ticket.status];
        return (
          <li key={ticket.id}>
            <Card className="p-4 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-xs font-semibold text-[#777879]">{ticket.id}</p><h3 className="mt-1 text-sm font-semibold leading-5 text-black">{ticket.title}</h3></div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="mt-2 text-sm text-[#666768]">{ticket.client}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant={priority.variant}>Prioridad {priority.label.toLowerCase()}</Badge>
                {ticket.unreadMessages > 0 && <Badge variant="info"><MessageCircle aria-hidden="true" className="mr-1 size-3" />{ticket.unreadMessages} sin leer</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#eceeef] pt-3 text-xs text-[#777879]">
                <span>{ticket.budget ? money.format(ticket.budget) : "Sin cotizar"}</span><span>{ticket.updatedAt}</span>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <Card className="hidden overflow-hidden shadow-none md:block">
      <Table>
        <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Cliente</TableHead><TableHead>Prioridad</TableHead><TableHead>Estado</TableHead><TableHead>Cotización</TableHead><TableHead className="text-right">Actualizado</TableHead></TableRow></TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            const priority = priorityMeta[ticket.priority];
            const status = statusMeta[ticket.status];
            return (
              <TableRow key={ticket.id}>
                <TableCell><div className="max-w-xs"><div className="flex items-center gap-2"><span className="text-xs font-semibold text-[#777879]">{ticket.id}</span>{ticket.unreadMessages > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4648d4]"><MessageCircle aria-hidden="true" className="size-3" />{ticket.unreadMessages}</span>}</div><p className="mt-1 font-semibold text-black">{ticket.title}</p></div></TableCell>
                <TableCell className="text-[#4c4546]">{ticket.client}</TableCell>
                <TableCell><Badge variant={priority.variant}>{priority.label}</Badge></TableCell>
                <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                <TableCell className="font-medium text-[#353839]">{ticket.budget ? money.format(ticket.budget) : "Sin cotizar"}</TableCell>
                <TableCell className="text-right text-xs text-[#777879]">{ticket.updatedAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function TicketResults({ tickets, query }: { tickets: Ticket[]; query: string }) {
  if (tickets.length === 0) {
    return (
      <Card className="grid min-h-64 place-items-center border-dashed p-6 text-center shadow-none">
        <div className="max-w-sm"><span className="mx-auto grid size-11 place-items-center rounded-lg bg-[#f3f4f5] text-[#666768]"><Inbox aria-hidden="true" className="size-5" /></span><h2 className="mt-4 font-semibold text-black">{query ? "No encontramos tickets" : "No hay tickets en esta sección"}</h2><p className="mt-2 text-sm leading-6 text-[#777879]">{query ? "Probá con otro título, cliente o identificador." : "Los tickets nuevos aparecerán acá automáticamente."}</p></div>
      </Card>
    );
  }

  return <><TicketCards tickets={tickets} /><TicketTable tickets={tickets} /></>;
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const filteredTickets = useMemo(() => tickets.filter((ticket) => [ticket.id, ticket.title, ticket.client].some((field) => field.toLocaleLowerCase("es").includes(normalizedQuery))), [tickets, normalizedQuery]);
  const pendingTickets = filteredTickets.filter((ticket) => ticket.status === "pending");
  const activeTickets = filteredTickets.filter((ticket) => ticket.status === "in_progress");
  const pendingCount = tickets.filter((ticket) => ticket.status === "pending").length;
  const activeCount = tickets.filter((ticket) => ticket.status === "in_progress").length;

  return (
    <div>
      <div className="relative mb-5 w-full sm:max-w-sm">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a8b8c]" />
        <label htmlFor="ticket-search" className="sr-only">Buscar tickets</label>
        <input id="ticket-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por ticket, título o cliente" className="min-h-11 w-full rounded-lg border border-[#d9dadb] bg-white py-2.5 pl-10 pr-3 text-sm text-black outline-none transition-colors placeholder:text-[#a1a2a3] focus:border-[#6063ee] focus:ring-2 focus:ring-[#daddff]" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes <span className="rounded-full bg-[#fff3d4] px-2 py-0.5 text-[0.68rem] text-[#8a5a00]">{pendingCount}</span></TabsTrigger>
          <TabsTrigger value="in-progress">En curso <span className="rounded-full bg-[#ecf9f1] px-2 py-0.5 text-[0.68rem] text-[#187342]">{activeCount}</span></TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><TicketResults tickets={pendingTickets} query={query} /></TabsContent>
        <TabsContent value="in-progress"><TicketResults tickets={activeTickets} query={query} /></TabsContent>
      </Tabs>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#777879]">
        <span className="inline-flex items-center gap-1.5"><CircleDollarSign aria-hidden="true" className="size-3.5" />Valores de demostración en pesos argentinos</span>
        <span>{filteredTickets.length} de {tickets.length} tickets visibles</span>
      </div>
    </div>
  );
}
