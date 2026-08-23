import Link from "next/link";
import { redirect } from "next/navigation";
import { LuCircleAlert, LuTicket, LuCircleCheck, LuFolder, LuSearch, LuFilter } from "react-icons/lu";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { NewTicketDialog } from "@/app/components/tickets/NewTicketDialog";
import { TicketActions } from "@/app/components/tickets/TicketActions";

export const dynamic = "force-dynamic";

// Etiqueta + chip por estado. Indigo solo para los estados "en movimiento":
// el resto es neutro, segun DESIGN.md.
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

/** Mismo criterio que la server action: la UI no decide permisos por su cuenta. */
const CANCELABLE: TicketStatus[] = ["PENDING", "CLARIFYING", "QUOTED"];

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function TicketsPage({ searchParams }: PageProps<"/dashboard/tickets">) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const staff = isStaff(session.user.role);
  const userId = session.user.id;
  const params = await searchParams;
  const q = param(params.q);
  const statusFilter = param(params.status) as TicketStatus | "";

  let tickets;
  let projects;
  try {
    [tickets, projects] = await Promise.all([
      prisma.ticket.findMany({
        // Staff ve todos los tickets abiertos; un USER solo los propios.
        where: {
          ...(staff ? {} : { createdById: userId }),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { project: { name: { contains: q, mode: "insensitive" } } }] } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          createdById: true,
          project: {
            select: {
              name: true,
              conversations: {
                where: { kind: "AI" },
                orderBy: { updatedAt: "desc" },
                take: 1,
                select: { id: true },
              },
            },
          },
          createdBy: { select: { name: true, email: true } },
          // Cotizacion vigente: la ultima enviada.
          quotes: {
            where: { status: "SENT" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { amount: true, currency: true, estimatedDays: true },
          },
        },
      }),
      prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, thumbnail: true },
      }),
    ]);
  } catch (error) {
    console.error("[tickets] fallo el listado de tickets", {
      userId,
      staff,
      error,
    });

    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
        <div className="flex items-start gap-3 rounded-lg border border-[#cfc4c5] bg-[#ffffff] px-4 py-5 md:px-6">
          <LuCircleAlert className="mt-0.5 size-5 shrink-0 text-[#4648d4]" aria-hidden />
          <div>
            <h1 className="text-base font-semibold leading-6">
              No pudimos cargar los tickets
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

  const now = new Date();
  const activeCount = tickets.filter(
    (t) => !["DONE", "REJECTED", "CANCELLED"].includes(t.status),
  ).length;
  const completedThisMonth = tickets.filter(
    (t) =>
      t.status === "DONE" &&
      t.createdAt.getMonth() === now.getMonth() &&
      t.createdAt.getFullYear() === now.getFullYear(),
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">
            Tickets
          </h1>
          <p className="mt-2 text-sm leading-5 text-[#4c4546]">
            {staff
              ? "Todos los tickets abiertos en la plataforma."
              : "Visualiza su estado."}
          </p>
        </div>

        {projects.length > 0 ? (
          <NewTicketDialog projects={projects} />
        ) : (
          <Link
            href="/dashboard/builder"
            className="inline-flex items-center justify-center rounded-md border border-[#191c1d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#191c1d] hover:bg-[#edeeef]"
          >
            Crea un proyecto para abrir tickets
          </Link>
        )}
      </div>

      <form className="mt-8 grid gap-3 border-y border-[#f3f4f5] py-4 sm:grid-cols-[1fr_12rem_auto]">
        <label className="relative">
          <LuSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7e7576]" aria-hidden />
          <span className="sr-only">Buscar</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por titulo o proyecto"
            className="h-11 w-full rounded-md border border-[#d9dadb] pl-10 pr-3 text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select name="status" defaultValue={statusFilter} className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white">
          <LuFilter className="size-4" aria-hidden />
          Filtrar
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#f3f4f5] bg-[#ffffff] p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Tickets activos
            </span>
            <LuTicket className="size-5 text-[#4648d4]" aria-hidden />
          </div>
          <p className="mt-3 text-[32px] font-semibold leading-10 tracking-[-0.01em]">
            {activeCount}
          </p>
        </div>
        <div className="rounded-lg border border-[#f3f4f5] bg-[#ffffff] p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Completados (mes)
            </span>
            <LuCircleCheck className="size-5 text-green-600" aria-hidden />
          </div>
          <p className="mt-3 text-[32px] font-semibold leading-10 tracking-[-0.01em]">
            {completedThisMonth}
          </p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-[#f3f4f5] bg-[#ffffff] px-6 py-20 text-center">
          <LuTicket className="size-6 text-[#7e7576]" aria-hidden />
          <p className="text-sm leading-5 text-[#4c4546]">
            Todavia no hay tickets abiertos.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-[#f3f4f5] bg-[#ffffff]">
          <div className="hidden grid-cols-12 border-b border-[#f3f4f5] px-6 py-4 md:grid">
            <div className="col-span-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              ID / Fecha
            </div>
            <div className="col-span-6 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Asunto
            </div>
            <div className="col-span-2 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Estado
            </div>
            <div className="col-span-2 text-right text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
              Acción
            </div>
          </div>

          <ul className="divide-y divide-[#f3f4f5]">
            {tickets.map((ticket) => {
              const status = STATUS[ticket.status];
              const mine = ticket.createdById === userId;
              const quote = ticket.quotes[0];

              return (
                <li
                  key={ticket.id}
                  className="grid grid-cols-1 gap-3 px-4 py-5 md:grid-cols-12 md:items-center md:gap-0 md:px-6"
                >
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium leading-5">#{ticket.id.slice(-4)}</p>
                    <p className="mt-0.5 text-xs leading-4 text-[#7e7576]">
                      {dateFmt.format(ticket.createdAt)}
                    </p>
                  </div>

                  <div className="min-w-0 md:col-span-6">
                    <p className="truncate text-base font-medium leading-6">
                      {ticket.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4c4546]">
                      {ticket.description}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs leading-4 text-[#7e7576]">
                      {ticket.project.conversations[0] ? (
                        <Link
                          href={`/dashboard/builder/${ticket.project.conversations[0].id}`}
                          className="inline-flex items-center gap-1 text-[#4648d4] hover:underline"
                        >
                          <LuFolder className="size-3" aria-hidden />
                          {ticket.project.name}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <LuFolder className="size-3" aria-hidden />
                          {ticket.project.name}
                        </span>
                      )}
                      {staff
                        ? ` · ${ticket.createdBy.name ?? ticket.createdBy.email}`
                        : ""}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase leading-4 tracking-[0.05em] ${status.chip}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-start gap-2 md:col-span-2 md:justify-end">
                    {mine ? (
                      <TicketActions
                        ticketId={ticket.id}
                        quote={
                          ticket.status === "QUOTED" && quote
                            ? {
                                amount: quote.amount.toFixed(2),
                                currency: quote.currency,
                                estimatedDays: quote.estimatedDays,
                              }
                            : null
                        }
                        cancelable={CANCELABLE.includes(ticket.status)}
                      />
                    ) : null}
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="inline-flex items-center justify-center rounded-md border border-[#191c1d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#191c1d] hover:bg-[#edeeef]"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
