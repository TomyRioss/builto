"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createQuote, type AdminActionState } from "@/app/admin/tickets/actions";

const initialState: AdminActionState = { ok: false, error: null };

export function QuoteForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(createQuote, initialState);
  useEffect(() => { if (state.ok) toast.success("Cotizacion enviada al cliente."); else if (state.error) toast.error(state.error); }, [state]);
  return <form action={action} className="grid gap-4"><input type="hidden" name="ticketId" value={ticketId} /><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Precio<input name="amount" type="number" min="1" step="0.01" required className="mt-2 h-11 w-full rounded-md border border-[#d9dadb] px-3 font-normal" /></label><label className="text-sm font-medium">Moneda<select name="currency" className="mt-2 h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 font-normal"><option value="ARS">ARS</option><option value="USD">USD</option></select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Tiempo estimado (dias habiles)<input name="estimatedDays" type="number" min="1" max="365" required className="mt-2 h-11 w-full rounded-md border border-[#d9dadb] px-3 font-normal" /></label><label className="text-sm font-medium">Vence el<input name="expiresAt" type="date" className="mt-2 h-11 w-full rounded-md border border-[#d9dadb] px-3 font-normal" /></label></div><label className="text-sm font-medium">Notas para el cliente<textarea name="notes" rows={4} maxLength={3000} className="mt-2 w-full rounded-md border border-[#d9dadb] p-3 font-normal" placeholder="Alcance incluido, supuestos y condiciones." /></label><button type="submit" disabled={pending} className="min-h-11 rounded-md bg-black px-5 text-sm font-medium text-white disabled:opacity-50">{pending ? "Enviando..." : "Enviar cotizacion"}</button></form>;
}
