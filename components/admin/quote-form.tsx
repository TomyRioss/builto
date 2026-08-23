"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { createQuote, type AdminActionState } from "@/app/admin/tickets/actions";

const initialState: AdminActionState = { ok: false, error: null };
const inputClass = "mt-2 h-11 w-full rounded border border-[#d9dadb] px-3 font-normal outline-none transition-colors focus:border-black";

export function QuoteForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(createQuote, initialState);
  useEffect(() => { if (state.ok) toast.success("Cotizacion enviada al cliente."); else if (state.error) toast.error(state.error); }, [state]);
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Precio<input name="amount" type="number" min="1" step="0.01" required className={inputClass} /></label>
        <label className="text-sm font-medium">
          Moneda
          <select name="currency" defaultValue="ARS" required className={`${inputClass} bg-white`}>
            <option value="ARS">Pesos argentinos (ARS)</option>
            <option value="USD">Dolares estadounidenses (USD)</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Tiempo estimado (dias habiles)<input name="estimatedDays" type="number" min="1" max="365" required className={inputClass} /></label>
        <label className="text-sm font-medium">Vence el<input name="expiresAt" type="date" className={inputClass} /></label>
      </div>
      <label className="text-sm font-medium">Notas para el cliente<textarea name="notes" rows={4} maxLength={3000} className="mt-2 w-full rounded border border-[#d9dadb] p-3 font-normal outline-none transition-colors focus:border-black" placeholder="Alcance incluido, supuestos y condiciones." /></label>
      <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-black/85 disabled:pointer-events-none disabled:opacity-50">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {pending ? "Enviando..." : "Enviar cotizacion"}
      </button>
    </form>
  );
}
