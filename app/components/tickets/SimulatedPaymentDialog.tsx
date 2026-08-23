"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuBadgeCheck, LuCreditCard, LuLockKeyhole, LuX } from "react-icons/lu";
import { toast } from "sonner";

import { simulateQuotePayment } from "@/app/dashboard/(main)/tickets/actions";

type Props = {
  quoteId: string;
  amount: string;
  defaultOpen?: boolean;
};

export function SimulatedPaymentDialog({ quoteId, amount, defaultOpen = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();

  function confirmPayment() {
    startTransition(async () => {
      const result = await simulateQuotePayment(quoteId);
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos completar el pago.");
        return;
      }
      toast.success("Pago simulado acreditado correctamente.");
      setOpen(false);
      router.replace("/dashboard/quotes");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-4 text-sm font-semibold text-white hover:bg-[#3739b8]"
      >
        <LuCreditCard aria-hidden className="size-4" />
        Simular pago
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`payment-title-${quoteId}`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#e1e3e4] px-5 py-4">
              <div>
                <span className="rounded bg-[#fff3cd] px-2 py-1 text-[11px] font-semibold uppercase text-[#765900]">
                  Entorno de prueba
                </span>
                <h2 id={`payment-title-${quoteId}`} className="mt-3 text-xl font-semibold text-black">
                  Simular pago
                </h2>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded text-[#666768] hover:bg-[#f3f4f5] disabled:opacity-50"
                title="Cerrar"
              >
                <LuX aria-hidden className="size-5" />
                <span className="sr-only">Cerrar</span>
              </button>
            </header>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-md bg-[#f5f7f8] p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded bg-[#4648d4] text-white">
                  <LuCreditCard aria-hidden className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-[#666768]">Total a acreditar</p>
                  <p className="mt-1 text-xl font-semibold text-black">{amount}</p>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-[#d9dadb] p-4">
                <p className="text-sm font-semibold text-black">Mercado Pago simulado</p>
                <p className="mt-2 text-sm leading-6 text-[#666768]">
                  No se solicitaran datos de tarjeta ni se cobrara dinero real. La confirmacion registra una transaccion de prueba y habilita el ticket.
                </p>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-[#777879]">
                <LuLockKeyhole aria-hidden className="size-4" />
                Simulacion exclusiva para el MVP
              </p>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-[#e1e3e4] bg-[#f8f9fa] p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-md border border-[#d9dadb] bg-white px-5 text-sm font-medium text-black disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={confirmPayment}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-5 text-sm font-semibold text-white hover:bg-[#3739b8] disabled:cursor-wait disabled:opacity-60"
              >
                <LuBadgeCheck aria-hidden className="size-4" />
                {pending ? "Acreditando..." : "Confirmar pago de prueba"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
