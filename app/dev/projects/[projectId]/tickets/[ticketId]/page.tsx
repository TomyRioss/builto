import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, CircleUserRound, FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { StatusBadge } from "@/components/dev/status-badge";
import { TicketWorkflowActions } from "@/components/dev/tickets/ticket-workflow-actions";
import { getDevProjectDetail } from "@/lib/dev/projects";
import { isStaff } from "@/lib/permissions";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function DevTicketDetailPage(
  props: PageProps<"/dev/projects/[projectId]/tickets/[ticketId]">
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const { projectId, ticketId } = await props.params;
  const project = await getDevProjectDetail(projectId);
  const ticket = project?.tickets.find((item) => item.id === ticketId);
  if (!project || !ticket) notFound();

  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <Link href={`/dev/projects/${project.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4] hover:underline">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver al proyecto
      </Link>

      <header className="mt-7 border-b border-[#e1e3e4] pb-7">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]"><FolderOpen aria-hidden="true" className="size-4" />{project.name}</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#777879]">Ticket #{ticket.id.slice(-6).toUpperCase()}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">{ticket.title}</h1>
          </div>
          <StatusBadge status={ticket.status} assignedDevId={ticket.assignedDevId} currentDeveloperId={session.user.id} />
        </div>
      </header>

      <section aria-labelledby="ticket-description" className="mt-8 rounded-lg border border-[#d9dadb] bg-white p-5 sm:p-6">
        <h2 id="ticket-description" className="text-lg font-semibold text-black">Solicitud tecnica</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4c4546]">{ticket.description}</p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#eceeef] pt-5 text-xs text-[#777879]">
          <span className="inline-flex items-center gap-2"><CircleUserRound aria-hidden="true" className="size-4" />{ticket.assignedDev ? `Asignado a ${ticket.assignedDev.name ?? ticket.assignedDev.email}` : "Sin desarrollador asignado"}</span>
          <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" className="size-4" />Creado {dateFormatter.format(ticket.createdAt)}</span>
          <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" className="size-4" />Actualizado {dateFormatter.format(ticket.updatedAt)}</span>
        </div>

        <TicketWorkflowActions
          projectId={project.id}
          ticketId={ticket.id}
          status={ticket.status}
          assignedDevId={ticket.assignedDevId}
          assignedDevName={ticket.assignedDev?.name ?? ticket.assignedDev?.email ?? null}
          currentDeveloperId={session.user.id}
        />
      </section>
    </div>
  );
}
