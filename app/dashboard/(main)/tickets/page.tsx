import Link from "next/link";
import { redirect } from "next/navigation";
import { LuCircleAlert, LuTicket } from "react-icons/lu";

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

export default async function TicketsPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const staff = isStaff(session.user.role);
  const userId = session.user.id;

  let tickets;
  let projects;
  try {
    [tickets, projects] = await Promise.all([
      prisma.ticket.findMany({
        // Staff ve todos los tickets abiertos; un USER solo los propios.
        where: staff ? undefined : { createdById: userId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          createdById: true,
          project: { select: { name: true } },
          createdBy: { select: { name: true, email: true } },
          // Cotizacion vigente: la ultima enviada.
          quotes: {
            where: { status: "SENT" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { amount: true, currency: true },
          },
        },
      }),
      prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
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
              : "Los tickets que abriste y su estado."}
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

      {tickets.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 border-y border-[#cfc4c5] bg-[#ffffff] px-6 py-20 text-center">
          <LuTicket className="size-6 text-[#7e7576]" aria-hidden />
          <p className="text-sm leading-5 text-[#4c4546]">
            Todavia no hay tickets abiertos.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[#cfc4c5] border-y border-[#cfc4c5] bg-[#ffffff]">
          {tickets.map((ticket) => {
            const status = STATUS[ticket.status];
            const mine = ticket.createdById === userId;
            const quote = ticket.quotes[0];

            return (
              <li
                key={ticket.id}
                className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-start md:gap-6 md:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium leading-6">
                    {ticket.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4c4546]">
                    {ticket.description}
                  </p>
                  <p className="mt-2 text-xs leading-4 text-[#7e7576]">
                    {ticket.project.name}
                    {staff
                      ? ` · ${ticket.createdBy.name ?? ticket.createdBy.email}`
                      : ""}
                  </p>

                  {mine && (
                    <div className="mt-4">
                      <TicketActions
                        ticketId={ticket.id}
                        quote={
                          ticket.status === "QUOTED" && quote
                            ? {
                                amount: quote.amount.toFixed(2),
                                currency: quote.currency,
                              }
                            : null
                        }
                        cancelable={CANCELABLE.includes(ticket.status)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4 md:w-56 md:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] ${status.chip}`}
                  >
                    {status.label}
                  </span>
                  <span className="text-xs leading-4 text-[#7e7576]">
                    {dateFmt.format(ticket.createdAt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
