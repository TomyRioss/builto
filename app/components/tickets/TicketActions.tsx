"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  cancelTicket,
  respondQuote,
  type ActionState,
} from "@/app/dashboard/(main)/tickets/actions";

type Props = {
  ticketId: string;
  /** Cotizacion vigente, solo cuando el ticket esta en QUOTED. */
  quote: { amount: string; currency: string; estimatedDays: number | null } | null;
  cancelable: boolean;
};

export function TicketActions({ ticketId, quote, cancelable }: Props) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<ActionState>, okMsg: string) {
    startTransition(async () => {
      try {
        const res = await fn();
        if (res.ok) toast.success(okMsg);
        else toast.error(res.error ?? "Algo salio mal.");
      } catch (error) {
        console.error("[tickets] la accion del ticket fallo", {
          ticketId,
          error,
        });
        toast.error("No pudimos completar la accion. Proba de nuevo.");
      }
    });
  }

  if (!quote && !cancelable) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {quote && (
        <>
          <span className="text-sm font-medium leading-5">
            {quote.currency} {quote.amount}
            {quote.estimatedDays ? ` · ${quote.estimatedDays} dias habiles` : ""}
          </span>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => run(() => respondQuote(ticketId, true), "Cotizacion aceptada.")}
          >
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => respondQuote(ticketId, false), "Cotizacion rechazada.")}
          >
            Rechazar
          </Button>
        </>
      )}

      {cancelable && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => cancelTicket(ticketId), "Ticket cancelado.")}
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}
