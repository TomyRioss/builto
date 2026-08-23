import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { auth } from "@/auth";
import { TicketsStats } from "@/components/dev/tickets/tickets-stats";
import { TicketsTable } from "@/components/dev/tickets/tickets-table";
import { getDevProjectDetail } from "@/lib/dev/projects";
import { isStaff } from "@/lib/permissions";

const projectStatus = {
  DRAFT: "Borrador",
  ONBOARDING: "Configurando",
  READY: "Listo",
  ARCHIVED: "Archivado",
} as const;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const CLOSED_STATUSES = ["DONE", "REJECTED", "CANCELLED"] as const;

export default async function DevProjectDetailPage(
  props: PageProps<"/dev/projects/[projectId]">
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const { projectId } = await props.params;
  const project = await getDevProjectDetail(projectId);
  if (!project) notFound();

  const now = new Date();
  const activeTickets = project.tickets.filter(
    (ticket) => !CLOSED_STATUSES.includes(ticket.status as (typeof CLOSED_STATUSES)[number])
  ).length;

  const completedThisMonth = project.tickets.filter(
    (ticket) =>
      ticket.status === "DONE" &&
      ticket.updatedAt.getFullYear() === now.getFullYear() &&
      ticket.updatedAt.getMonth() === now.getMonth()
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link
        href="/dev/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4] hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver a proyectos
      </Link>

      <header className="mt-7 border-b border-[#e1e3e4] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-[#4648d4]">
            Proyecto de {project.owner.name ?? project.owner.email}
          </p>
          <span className="rounded-full bg-[#f3f4f5] px-2.5 py-1 text-xs font-medium text-[#4c4546]">
            {projectStatus[project.status]}
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">
          {project.name}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#666768]">
          <span className="inline-flex items-center gap-2">
            <ClipboardList aria-hidden="true" className="size-4" />
            {project.tickets.length}{" "}
            {project.tickets.length === 1 ? "ticket" : "tickets"}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4" />
            Actualizado {dateFormatter.format(project.updatedAt)}
          </span>
        </div>

        {project.metadata.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.metadata.technologies.map((item) => (
              <span
                key={item}
                className="rounded-md bg-[#eef0ff] px-2 py-1 text-xs font-medium text-[#4648d4]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </header>

      <section aria-labelledby="tickets-title" className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="tickets-title" className="text-xl font-semibold text-black">
              Tickets asociados
            </h2>
            <p className="mt-1 text-sm text-[#666768]">
              Consulta las solicitudes tecnicas de este proyecto. Toma un ticket
              disponible para comenzar a trabajar.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <TicketsStats activos={activeTickets} completadosMes={completedThisMonth} />
        </div>

        <div className="mt-7">
          <TicketsTable projectId={project.id} tickets={project.tickets} currentDeveloperId={session.user.id} />
        </div>
      </section>

    </div>
  );
}
