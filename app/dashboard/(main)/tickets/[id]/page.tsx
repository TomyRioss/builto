import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  LuArrowLeft,
  LuCalendar,
  LuCheck,
  LuCircleAlert,
  LuFileText,
  LuRefreshCw,
  LuTicket,
} from "react-icons/lu";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { TicketActions } from "@/app/components/tickets/TicketActions";
import { ticketProgress } from "@/lib/dashboard/ticket-progress";
import { signAttachmentUrls } from "@/lib/storage/ticket-attachments";

export const dynamic = "force-dynamic";

const STATUS: Record<TicketStatus, { label: string; chip: string }> = {
  PENDING: { label: "Pendiente", chip: "bg-[#edeeef] text-[#4c4546]" },
  CLARIFYING: { label: "En consulta", chip: "bg-[#edeeef] text-[#4c4546]" },
  QUOTED: { label: "Cotizado", chip: "bg-[#eef2ff] text-[#4648d4]" },
  ACCEPTED: { label: "Aceptado", chip: "bg-[#edeeef] text-[#4c4546]" },
  PAID: { label: "Pagado", chip: "bg-[#eef2ff] text-[#4648d4]" },
  IN_PROGRESS: { label: "En curso", chip: "bg-[#eef2ff] text-[#4648d4]" },
  REVIEW: { label: "En revision", chip: "bg-[#eef2ff] text-[#4648d4]" },
  DONE: { label: "Listo", chip: "bg-[#edeeef] text-[#191c1d]" },
  REJECTED: { label: "Rechazado", chip: "bg-[#edeeef] text-[#7e7576]" },
  CANCELLED: { label: "Cancelado", chip: "bg-[#edeeef] text-[#7e7576]" },
};

const CANCELABLE: TicketStatus[] = ["PENDING", "CLARIFYING", "QUOTED"];

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relFmt = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/** Fecha relativa corta: el feed de la referencia muestra "hace 2 horas". */
function relative(at: Date, now: number) {
  const minutes = Math.round((at.getTime() - now) / 60000);

  if (Math.abs(minutes) < 60) return relFmt.format(minutes, "minute");
  if (Math.abs(minutes) < 60 * 24) return relFmt.format(Math.round(minutes / 60), "hour");
  return relFmt.format(Math.round(minutes / 1440), "day");
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");

  const staff = isStaff(session.user.role);
  const userId = session.user.id;

  let ticket;
  try {
    ticket = await prisma.ticket.findFirst({
      where: staff ? { id } : { id, createdById: userId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdById: true,
        project: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        assignedDev: { select: { name: true, email: true } },
        attachments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, storageKey: true, mimeType: true },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            currency: true,
            notes: true,
            status: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("[tickets] fallo el detalle de ticket", { id, userId, error });

    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
        <div className="flex items-start gap-3 rounded-lg border border-[#cfc4c5] bg-[#ffffff] px-4 py-5 md:px-6">
          <LuCircleAlert className="mt-0.5 size-5 shrink-0 text-[#4648d4]" aria-hidden />
          <div>
            <h1 className="text-base font-semibold leading-6">
              No pudimos cargar el ticket
            </h1>
            <p className="mt-2 text-sm leading-5 text-[#4c4546]">
              Hubo un error al consultar la base. Recarga la pagina en unos
              segundos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) notFound();

  const status = STATUS[ticket.status];
  const mine = ticket.createdById === userId;
  const activeQuote = ticket.quotes.find((q) => q.status === "SENT");
  // La primera cotizacion enviada marca la fecha de la etapa "Aprobacion".
  const firstQuote = ticket.quotes.at(-1) ?? null;

  const progress = ticketProgress({
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    quotedAt: firstQuote?.createdAt ?? null,
  });

  // URLs firmadas (1 h) para las referencias. Si Storage falla, el resto de la
  // pagina sigue viva: mostramos el aviso en lugar de las imagenes.
  let signed: Record<string, string> = {};
  let attachmentsError = false;
  if (ticket.attachments.length > 0) {
    try {
      signed = await signAttachmentUrls(ticket.attachments.map((a) => a.storageKey));
    } catch (error) {
      console.error("[tickets] no pudimos firmar los adjuntos", {
        ticketId: ticket.id,
        error,
      });
      attachmentsError = true;
    }
  }

  const now = Date.now();
  // Feed real: creacion + cotizaciones + ultimo movimiento. Sin datos inventados.
  const feed = [
    {
      id: `created-${ticket.id}`,
      Icon: LuTicket,
      text: `Abriste el ticket "${ticket.title}"`,
      at: ticket.createdAt,
    },
    ...ticket.quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      Icon: LuFileText,
      text: `Cotizacion por ${quote.currency} ${quote.amount.toFixed(2)}`,
      at: quote.createdAt,
    })),
    ...(ticket.updatedAt.getTime() !== ticket.createdAt.getTime()
      ? [
          {
            id: `status-${ticket.id}`,
            Icon: LuRefreshCw,
            text: `El ticket paso a "${status.label}"`,
            at: ticket.updatedAt,
          },
        ]
      : []),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <Link
        href="/dashboard/tickets"
        className="inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-[#4c4546] hover:text-[#191c1d]"
      >
        <LuArrowLeft className="size-4" aria-hidden />
        Tickets
      </Link>

      <header className="mt-6 flex flex-col gap-4 border-b border-[#e1e3e4] pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-4 text-[#7e7576]">
            #{ticket.id.slice(-4)} · {dateTimeFmt.format(ticket.createdAt)}
          </p>
          <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">
            {ticket.title}
          </h1>
          <p className="mt-2 text-base leading-6 text-[#4c4546]">
            Seguimiento de la tarea delegada, paso a paso.
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] ${status.chip}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {status.label}
        </span>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          {/* Estado global */}
          <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-medium leading-7">Estado global</h2>
                <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-[#4c4546]">
                  <LuRefreshCw className="size-4 text-[#4648d4]" aria-hidden />
                  Fase actual: {progress.currentLabel}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[48px] font-semibold leading-[56px] tracking-[-0.02em]">
                  {progress.percent}%
                </p>
                <p className="text-sm leading-5 text-[#4c4546]">Completado</p>
              </div>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e1e3e4]">
              <div
                className="h-2 rounded-full bg-[#4648d4]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-[#e1e3e4] pt-4 text-sm leading-5 text-[#4c4546]">
              <LuCalendar className="size-4" aria-hidden />
              Ultimo movimiento: {dateTimeFmt.format(ticket.updatedAt)}
            </div>
          </section>

          {/* Cronograma */}
          <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-8">
            <h2 className="text-xl font-medium leading-7">Cronograma</h2>

            <ol className="relative mt-8">
              <div
                className="absolute left-4 top-2 bottom-6 w-px bg-[#e1e3e4]"
                aria-hidden
              />
              {progress.stages.map((stage, i) => {
                const last = i === progress.stages.length - 1;
                const muted = stage.state === "pending";

                return (
                  <li key={stage.key} className={`relative flex gap-4 ${last ? "" : "mb-8"}`}>
                    <span
                      className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${
                        stage.state === "done"
                          ? "bg-[#4648d4] text-[#ffffff]"
                          : stage.state === "current"
                            ? "border-2 border-[#4648d4] bg-[#eef2ff]"
                            : "bg-[#e1e3e4]"
                      }`}
                    >
                      {stage.state === "done" ? (
                        <LuCheck className="size-4" aria-hidden />
                      ) : stage.state === "current" ? (
                        <span className="size-2.5 rounded-full bg-[#4648d4]" />
                      ) : null}
                    </span>

                    <div
                      className={`flex-1 ${last ? "" : "border-b border-[#e1e3e4] pb-4"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3
                          className={`text-base font-medium leading-6 ${
                            muted ? "text-[#7e7576]" : ""
                          }`}
                        >
                          {stage.label}
                        </h3>
                        <span
                          className={`shrink-0 text-sm leading-5 ${
                            stage.state === "current"
                              ? "font-medium text-[#4648d4]"
                              : "text-[#7e7576]"
                          }`}
                        >
                          {stage.at
                            ? dateFmt.format(stage.at)
                            : stage.state === "current"
                              ? "En progreso"
                              : "Pendiente"}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm leading-5 ${
                          muted ? "text-[#7e7576] opacity-70" : "text-[#4c4546]"
                        }`}
                      >
                        {stage.detail}
                      </p>
                      {stage.state !== "pending" && (
                        <span
                          className={`mt-2 inline-flex rounded px-2 py-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] ${
                            stage.state === "current"
                              ? "bg-[#eef2ff] text-[#4648d4]"
                              : "bg-[#e7e8e9] text-[#4c4546]"
                          }`}
                        >
                          {stage.state === "current" ? "Fase actual" : "Completado"}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {progress.closed && (
              <p className="mt-6 border-t border-[#e1e3e4] pt-4 text-sm leading-5 text-[#7e7576]">
                {progress.currentLabel}: el cronograma quedo detenido.
              </p>
            )}
          </section>

          {/* Alcance */}
          <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-8">
            <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Alcance
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
              {ticket.description}
            </p>
          </section>

          {ticket.attachments.length > 0 && (
            <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-8">
              <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
                Imagenes de referencia
              </h2>
              {attachmentsError ? (
                <p className="mt-3 text-sm leading-5 text-[#ba1a1a]">
                  No pudimos cargar las imagenes. Recarga la pagina en unos segundos.
                </p>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-4">
                  {ticket.attachments.map((file) => {
                    const url = signed[file.storageKey];

                    return (
                      <li key={file.id}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Referencia adjunta al ticket"
                              className="size-28 rounded-md border border-[#e1e3e4] object-cover transition-opacity duration-150 hover:opacity-90"
                            />
                          </a>
                        ) : (
                          <span className="flex size-28 items-center justify-center rounded-md border border-[#e1e3e4] text-sm leading-5 text-[#7e7576]">
                            No disponible
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {ticket.quotes.length > 0 && (
            <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-8">
              <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
                Cotizaciones
              </h2>
              <ul className="mt-3 divide-y divide-[#f3f4f5]">
                {ticket.quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium leading-5">
                        {quote.currency} {quote.amount.toFixed(2)}
                      </p>
                      {quote.notes && (
                        <p className="mt-1 text-xs leading-4 text-[#7e7576]">
                          {quote.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium leading-4 text-[#7e7576]">
                      {dateTimeFmt.format(quote.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {mine && (
            <TicketActions
              ticketId={ticket.id}
              quote={
                ticket.status === "QUOTED" && activeQuote
                  ? {
                      amount: activeQuote.amount.toFixed(2),
                      currency: activeQuote.currency,
                    }
                  : null
              }
              cancelable={CANCELABLE.includes(ticket.status)}
            />
          )}
        </div>

        {/* Columna derecha */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-6">
            <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Detalle
            </h2>
            <dl className="mt-4 flex flex-col gap-4">
              <div>
                <dt className="text-xs leading-4 text-[#7e7576]">Proyecto</dt>
                <dd className="mt-1 text-sm leading-5">{ticket.project.name}</dd>
              </div>
              <div>
                <dt className="text-xs leading-4 text-[#7e7576]">Creado por</dt>
                <dd className="mt-1 text-sm leading-5">
                  {ticket.createdBy.name ?? ticket.createdBy.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs leading-4 text-[#7e7576]">Dev asignado</dt>
                <dd className="mt-1 text-sm leading-5">
                  {ticket.assignedDev
                    ? (ticket.assignedDev.name ?? ticket.assignedDev.email)
                    : "Sin asignar"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-6 lg:sticky lg:top-8">
            <h2 className="text-xl font-medium leading-7">Reciente</h2>
            <ul className="mt-6 flex flex-col gap-6">
              {feed.map(({ id: itemId, Icon, text, at }) => (
                <li key={itemId} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edeeef] text-[#4c4546]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-5">{text}</p>
                    <p className="mt-1 text-sm leading-5 text-[#7e7576]">
                      {relative(at, now)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
