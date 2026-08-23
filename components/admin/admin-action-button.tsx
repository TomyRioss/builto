"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArchiveX, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { archiveTicket, confirmManualPayment, setTicketStatus } from "@/app/admin/tickets/actions";
import { ADMIN_TICKET_STATUS } from "@/lib/admin/status";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AskDetailsLink({ ticketId }: { ticketId: string }) {
  return (
    <Link
      href={`/admin/tickets/${ticketId}/chat`}
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black px-4 text-sm font-medium transition-colors hover:bg-black hover:text-white"
    >
      <Send className="size-4" />
      Preguntar detalles
    </Link>
  );
}

export function ConfirmPaymentButton({ quoteId }: { quoteId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { const result = await confirmManualPayment(quoteId); if (result.ok) toast.success("Pago confirmado. El ticket ya esta disponible para Developers."); else toast.error(result.error); })}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black/85 disabled:pointer-events-none disabled:opacity-50"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Confirmando..." : "Confirmar pago"}
    </button>
  );
}

export function ArchiveTicketButton({ ticketId }: { ticketId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => { if (!confirm("Archivar este ticket? Pasa a estado Cancelado y deja de aparecer como activo.")) return; start(async () => { const result = await archiveTicket(ticketId); if (result.ok) toast.success("Ticket archivado."); else toast.error(result.error); }); }}
      className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded border border-[#f0d5d1] bg-white px-4 text-sm font-medium text-[#b42318] transition-colors hover:bg-[#fdf1f0] disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <ArchiveX className="size-4" />}
      {pending ? "Archivando..." : "Archivar ticket"}
    </button>
  );
}

export function ManualStatusForm({ ticketId, currentStatus }: { ticketId: string; currentStatus: string }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(currentStatus);

  const submit = () => {
    if (value === currentStatus) return;
    start(async () => {
      const result = await setTicketStatus(ticketId, value);
      if (result.ok) toast.success("Estado actualizado.");
      else { toast.error(result.error); setValue(currentStatus); }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(next) => next && setValue(next)} disabled={pending}>
        <SelectTrigger className="h-10 w-full flex-1 rounded border-[#d9dadb] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ADMIN_TICKET_STATUS).map(([status, label]) => <SelectItem key={status} value={status}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
      <button
        type="button"
        disabled={pending || value === currentStatus}
        onClick={submit}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded bg-[#4648d4] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4648d4]/90 disabled:pointer-events-none disabled:bg-[#eef0ff] disabled:text-[#4648d4]/40"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Cambiar
      </button>
    </div>
  );
}
