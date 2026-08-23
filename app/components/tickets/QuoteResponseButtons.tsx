"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuX } from "react-icons/lu";
import { toast } from "sonner";
import { respondQuote } from "@/app/dashboard/(main)/tickets/actions";

export function QuoteResponseButtons({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  function respond(accept: boolean) {
    start(async () => {
      const result = await respondQuote(ticketId, accept);
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos registrar tu respuesta.");
        return;
      }
      if (accept && result.quoteId) {
        toast.success("Cotizacion aceptada. Continua con el pago.");
        router.replace(`/dashboard/quotes?pay=${encodeURIComponent(result.quoteId)}`);
      } else {
        toast.success("Cotizacion rechazada.");
        router.refresh();
      }
    });
  }
  return <div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={pending} onClick={() => respond(true)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white disabled:opacity-50"><LuCheck className="size-4" />{pending ? "Procesando..." : "Aceptar cotizacion"}</button><button type="button" disabled={pending} onClick={() => respond(false)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#d9dadb] bg-white px-5 text-sm font-medium text-[#4c4546] hover:bg-[#f3f4f5] disabled:opacity-50"><LuX className="size-4" />Rechazar</button></div>;
}
