import Link from "next/link";
import { ArrowRight, Clock3, Code2, TicketCheck, UserRound } from "lucide-react";
import type { DevProject } from "@/lib/dev/projects";
import { getDeveloperTicketLabel } from "@/lib/dev/ticket-workflow";

const relativeTime = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

function formatRelativeDate(date: Date) {
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 1) return "Hoy";
  if (Math.abs(days) < 30) return relativeTime.format(days, "day");
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function DevProjectCard({ project, currentDeveloperId }: { project: DevProject; currentDeveloperId: string }) {
  const priority = project.metadata.priority;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d9dadb] bg-white transition-[border-color,box-shadow] hover:border-[#b9babb] hover:shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]">
      {project.metadata.preview && <div className="min-h-28 border-b border-[#e1e3e4] bg-[#f3f4f5] p-5"><p className="line-clamp-4 text-sm leading-6 text-[#4c4546]">{project.metadata.preview}</p></div>}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-black">{project.name}</h2><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#777879]"><UserRound aria-hidden="true" className="size-3.5" />{project.owner.name ?? "Cliente"}</p></div>
          <span className="shrink-0 rounded-full border border-[#f5dfaa] bg-[#fff8e7] px-2.5 py-1 text-[11px] font-semibold text-[#8a5a00]">{priority ? `Prioridad ${priority}` : "Sin prioridad"}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#666768]">
          <span className="inline-flex items-center gap-1.5"><TicketCheck aria-hidden="true" className="size-4 text-[#4648d4]" />{project._count.tickets} {project._count.tickets === 1 ? "ticket abierto" : "tickets abiertos"}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-4" />{formatRelativeDate(project.updatedAt)}</span>
        </div>

        {project.metadata.technologies.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Tecnologias">{project.metadata.technologies.map((technology) => <span key={technology} className="inline-flex items-center gap-1 rounded-md bg-[#eef0ff] px-2 py-1 text-xs font-medium text-[#4648d4]"><Code2 aria-hidden="true" className="size-3" />{technology}</span>)}</div>}

        <div className="mt-5 border-t border-[#eceeef] pt-4">
          <p className="text-xs font-semibold uppercase text-[#777879]">Tickets abiertos</p>
          {project.tickets.length === 0 ? <p className="mt-2 text-sm text-[#777879]">Este proyecto no tiene tickets abiertos.</p> : <ul className="mt-2 space-y-2">{project.tickets.map((ticket) => <li key={ticket.id} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate text-[#353839]">{ticket.title}</span><span className="shrink-0 text-xs text-[#777879]">{getDeveloperTicketLabel(ticket.status, ticket.assignedDevId, currentDeveloperId)}</span></li>)}</ul>}
        </div>

        <Link href={`/dev/projects/${project.id}`} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">Ver proyecto <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </div>
    </article>
  );
}
