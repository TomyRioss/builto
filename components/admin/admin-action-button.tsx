"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { confirmManualPayment, requestClarification } from "@/app/admin/tickets/actions";

export function ClarificationButton({ ticketId }: { ticketId: string }) {
  const [pending, start] = useTransition();
  return <button type="button" disabled={pending} onClick={() => start(async () => { const result = await requestClarification(ticketId); if (result.ok) toast.success("Aclaracion solicitada."); else toast.error(result.error); })} className="min-h-10 rounded-md border border-[#d9dadb] px-4 text-sm font-medium hover:bg-[#f3f4f5] disabled:opacity-50">{pending ? "Actualizando..." : "Solicitar aclaracion"}</button>;
}

export function ConfirmPaymentButton({ quoteId }: { quoteId: string }) {
  const [pending, start] = useTransition();
  return <button type="button" disabled={pending} onClick={() => start(async () => { const result = await confirmManualPayment(quoteId); if (result.ok) toast.success("Pago confirmado. El ticket ya esta disponible para Developers."); else toast.error(result.error); })} className="min-h-9 rounded-md bg-black px-4 text-sm font-medium text-white disabled:opacity-50">{pending ? "Confirmando..." : "Confirmar pago"}</button>;
}
