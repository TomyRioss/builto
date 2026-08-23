import Link from "next/link";
import { redirect } from "next/navigation";
import { LuCalendar, LuCheck, LuClock, LuFileText } from "react-icons/lu";

import { auth } from "@/auth";
import { QuoteResponseButtons } from "@/app/components/tickets/QuoteResponseButtons";
import { SimulatedPaymentDialog } from "@/app/components/tickets/SimulatedPaymentDialog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });
const quoteStatus = { SENT: "Esperando tu respuesta", ACCEPTED: "Aceptada", REJECTED: "Rechazada", EXPIRED: "Vencida" } as const;

function money(amount: { toNumber(): number }) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount.toNumber());
}

type ClientQuotesPageProps = {
  searchParams: Promise<{ pay?: string }>;
};

export default async function ClientQuotesPage({ searchParams }: ClientQuotesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { pay } = await searchParams;

  const quotes = await prisma.quote.findMany({
    where: { ticket: { createdById: session.user.id } },
    select: {
      id: true, amount: true, currency: true, estimatedDays: true, notes: true,
      status: true, expiresAt: true, createdAt: true,
      ticket: { select: { id: true, title: true, status: true, project: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingResponse = quotes.filter((quote) => quote.status === "SENT" && quote.ticket.status === "QUOTED");
  const pendingPayment = quotes.filter((quote) => quote.status === "ACCEPTED" && quote.ticket.status === "ACCEPTED");
  const activeIds = new Set([...pendingResponse, ...pendingPayment].map((quote) => quote.id));
  const history = quotes.filter((quote) => !activeIds.has(quote.id));

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <header>
        <p className="text-sm font-medium text-[#4648d4]">Tus solicitudes</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Cotizaciones</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546]">Revisa precio, tiempo y alcance antes de autorizar el trabajo.</p>
      </header>

      {pendingPayment.length > 0 && (
        <section className="mt-8" aria-labelledby="pending-payment-title">
          <h2 id="pending-payment-title" className="text-xl font-semibold">Pendientes de pago</h2>
          <p className="mt-1 text-sm text-[#666768]">Cotizaciones que ya aceptaste.</p>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {pendingPayment.map((quote) => (
              <article key={quote.id} className="rounded-lg border border-[#c9caff] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-[#4648d4]">{quote.ticket.project.name}</p>
                    <h3 className="mt-2 truncate text-lg font-semibold">{quote.ticket.title}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#4648d4]">Por pagar</span>
                </div>
                <div className="mt-5 flex flex-col gap-4 border-y border-[#eceeef] py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs text-[#777879]">Total</p><p className="mt-1 text-2xl font-semibold">{money(quote.amount)}</p></div>
                  <SimulatedPaymentDialog
                    quoteId={quote.id}
                    amount={money(quote.amount)}
                    defaultOpen={pay === quote.id}
                  />
                </div>
                <p className="mt-4 text-xs leading-5 text-[#777879]">El checkout es una simulacion: no procesa dinero ni solicita datos bancarios.</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="pending-response-title">
        <h2 id="pending-response-title" className="text-xl font-semibold">Pendientes de respuesta</h2>
        <p className="mt-1 text-sm text-[#666768]">{pendingResponse.length} {pendingResponse.length === 1 ? "cotizacion pendiente" : "cotizaciones pendientes"}</p>
        {pendingResponse.length === 0 ? (
          <div className="mt-5 grid min-h-56 place-items-center border-y border-[#e1e3e4] px-6 text-center"><div><LuFileText className="mx-auto size-7 text-[#777879]" /><p className="mt-3 text-sm font-medium">No tenes cotizaciones pendientes.</p></div></div>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {pendingResponse.map((quote) => (
              <article key={quote.id} className="rounded-lg border border-[#c9caff] bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase text-[#4648d4]">{quote.ticket.project.name}</p><h3 className="mt-2 truncate text-lg font-semibold">{quote.ticket.title}</h3></div><span className="shrink-0 rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs text-[#4648d4]">Pendiente</span></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-md bg-[#f8f9fa] p-4"><p className="text-xs text-[#777879]">Precio total</p><p className="mt-2 text-2xl font-semibold">{money(quote.amount)}</p></div><div className="rounded-md bg-[#f8f9fa] p-4"><p className="text-xs text-[#777879]">Tiempo estimado</p><p className="mt-2 text-lg font-semibold">{quote.estimatedDays ? `${quote.estimatedDays} dias habiles` : "A definir"}</p></div></div>
                {quote.notes && <div className="mt-5"><p className="text-xs font-semibold uppercase text-[#777879]">Alcance y condiciones</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4c4546]">{quote.notes}</p></div>}
                <div className="mt-5 flex flex-wrap gap-4 border-t border-[#eceeef] pt-4 text-xs text-[#777879]"><span className="inline-flex items-center gap-1.5"><LuCalendar className="size-4" />Enviada {date.format(quote.createdAt)}</span>{quote.expiresAt && <span className="inline-flex items-center gap-1.5"><LuClock className="size-4" />Vence {date.format(quote.expiresAt)}</span>}</div>
                <div className="mt-5"><QuoteResponseButtons ticketId={quote.ticket.id} /></div>
                <Link href={`/dashboard/tickets/${quote.ticket.id}`} className="mt-4 block text-center text-sm font-medium text-[#4648d4] hover:underline">Ver ticket completo</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Historial</h2>
        {history.length === 0 ? <p className="mt-4 text-sm text-[#666768]">Todavia no hay cotizaciones anteriores.</p> : (
          <div className="mt-5 overflow-x-auto rounded-lg border border-[#d9dadb]">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs uppercase text-[#777879]"><tr><th className="px-5 py-3">Ticket</th><th>Importe</th><th>Tiempo</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody className="divide-y divide-[#eceeef]">{history.map((quote) => {
                const paid = quote.status === "ACCEPTED" && quote.ticket.status === "PAID";
                return <tr key={quote.id}><td className="px-5 py-4"><Link href={`/dashboard/tickets/${quote.ticket.id}`} className="font-medium hover:text-[#4648d4]">{quote.ticket.title}</Link><p className="mt-1 text-xs text-[#777879]">{quote.ticket.project.name}</p></td><td>{money(quote.amount)}</td><td>{quote.estimatedDays ? `${quote.estimatedDays} dias` : "-"}</td><td>{paid ? <span className="inline-flex items-center gap-1.5 text-[#08783e]"><LuCheck className="size-4" />Pagada</span> : quoteStatus[quote.status]}</td><td>{date.format(quote.createdAt)}</td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
