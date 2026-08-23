import Link from "next/link";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "../status-badge";

type TicketRow = {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: TicketStatus;
  assignedDevId: string | null;
  createdAt: Date;
  project?: { name: string };
};

interface TicketsTableProps {
  projectId?: string;
  tickets: TicketRow[];
  currentDeveloperId: string;
  showProject?: boolean;
}

const dateFmt = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" });

export function TicketsTable({ tickets, projectId, currentDeveloperId, showProject = false }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white px-6 py-16 text-center">
        <p className="text-sm text-neutral-500">No hay tickets para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="hidden md:block"><Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">ID / Fecha</TableHead>
            <TableHead>Asunto</TableHead>
            {showProject && <TableHead className="w-[180px]">Proyecto</TableHead>}
            <TableHead className="w-[160px]">Estado</TableHead>
            <TableHead className="w-[120px] text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <p className="font-semibold text-neutral-900">#{t.id.slice(-6).toUpperCase()}</p>
                <p className="text-[13px] text-neutral-500">{dateFmt.format(t.createdAt)}</p>
              </TableCell>
              <TableCell className="max-w-[420px]">
                <p className="font-semibold text-neutral-900">{t.title}</p>
                <p className="truncate text-[13px] text-neutral-500">{t.description}</p>
              </TableCell>
              {showProject && <TableCell className="max-w-[180px]"><p className="truncate text-sm font-medium text-[#353839]">{t.project?.name ?? "Proyecto"}</p></TableCell>}
              <TableCell>
                <StatusBadge status={t.status} assignedDevId={t.assignedDevId} currentDeveloperId={currentDeveloperId} />
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/dev/projects/${t.projectId ?? projectId}/tickets/${t.id}`} className="flex min-h-9 items-center justify-center rounded-md border border-[#d9dadb] bg-white px-3 text-sm font-medium text-black hover:bg-[#f3f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">Ver detalle</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></div>

      <ul className="divide-y divide-[#eceeef] md:hidden">
        {tickets.map((ticket) => <li key={ticket.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#777879]">#{ticket.id.slice(-6).toUpperCase()} · {dateFmt.format(ticket.createdAt)}</p><h3 className="mt-2 text-sm font-semibold text-black">{ticket.title}</h3>{showProject && <p className="mt-1 text-xs font-medium text-[#4648d4]">{ticket.project?.name ?? "Proyecto"}</p>}</div><StatusBadge status={ticket.status} assignedDevId={ticket.assignedDevId} currentDeveloperId={currentDeveloperId} /></div><p className="mt-2 line-clamp-2 text-sm leading-5 text-[#666768]">{ticket.description}</p><Link href={`/dev/projects/${ticket.projectId ?? projectId}/tickets/${ticket.id}`} className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-md border border-[#d9dadb] bg-white px-3 text-sm font-medium text-black hover:bg-[#f3f4f5]">Ver detalle</Link></li>)}
      </ul>

      <div className="border-t border-[#e1e3e4] px-4 py-4 text-sm text-[#666768]">Mostrando {tickets.length} de {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}</div>
    </div>
  );
}
