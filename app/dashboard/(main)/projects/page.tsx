import { redirect } from "next/navigation";
import { LuCalendarDays, LuCodeXml, LuFolderOpen, LuHistory, LuTicket, LuUserRound } from "react-icons/lu";

import { auth } from "@/auth";
import { isStaff } from "@/lib/permissions";
import { getProjects } from "@/lib/projects/queries";
import type { ProjectStatus } from "@/app/generated/prisma/enums";

export const dynamic = "force-dynamic";

const STATUS: Record<ProjectStatus, { label: string; chip: string }> = {
  DRAFT: { label: "Borrador", chip: "bg-[#edeeef] text-[#4c4546]" },
  ONBOARDING: { label: "Configurando", chip: "bg-[#eef2ff] text-[#4648d4]" },
  READY: { label: "Listo", chip: "bg-[#e8f7ee] text-[#187342]" },
  ARCHIVED: { label: "Archivado", chip: "bg-[#edeeef] text-[#7e7576]" },
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type Project = Awaited<ReturnType<typeof getProjects>>[number];

function ProjectCounts({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#7e7576]">
      <span className="inline-flex items-center gap-1.5"><LuTicket aria-hidden className="size-3.5" />{project._count.tickets} tickets</span>
      <span className="inline-flex items-center gap-1.5"><LuCodeXml aria-hidden className="size-3.5" />{project._count.files} archivos</span>
      <span className="inline-flex items-center gap-1.5"><LuHistory aria-hidden className="size-3.5" />{project._count.versions} versiones</span>
    </div>
  );
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const staff = isStaff(session.user.role);
  const projects = await getProjects(staff ? undefined : session.user.id);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] md:text-[32px] md:leading-10">Proyectos</h1>
          <p className="mt-2 text-sm leading-5 text-[#4c4546]">{staff ? "Todos los proyectos de la plataforma." : "Tus proyectos y su actividad reciente."}</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[#7e7576]">{projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}</p>
      </header>

      {projects.length === 0 ? (
        <div className="mt-8 flex min-h-72 flex-col items-center justify-center gap-3 border-y border-[#cfc4c5] bg-[#ffffff] px-6 py-16 text-center">
          <LuFolderOpen aria-hidden className="size-6 text-[#7e7576]" />
          <h2 className="text-base font-semibold">Todavia no hay proyectos</h2>
          <p className="max-w-sm text-sm leading-5 text-[#4c4546]">Los proyectos creados en Builto apareceran automaticamente en esta seccion.</p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[#cfc4c5] border-y border-[#cfc4c5] bg-[#ffffff]">
          {projects.map((project) => {
            const status = STATUS[project.status];
            return (
              <li key={project.id} className="grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1.15fr)_minmax(12rem,0.8fr)_auto] md:items-center md:gap-6 md:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-medium leading-6">{project.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase leading-4 tracking-[0.05em] ${status.chip}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-xs text-[#7e7576]">/{project.slug}</p>
                </div>

                <div className="min-w-0 text-sm text-[#4c4546]">
                  <p className="flex items-center gap-2"><LuUserRound aria-hidden className="size-4 shrink-0 text-[#7e7576]" /><span className="truncate">{project.owner.name ?? project.owner.email}</span></p>
                  {project.owner.name && <p className="mt-1 truncate pl-6 text-xs text-[#7e7576]">{project.owner.email}</p>}
                </div>

                <div className="space-y-3 md:text-right">
                  <ProjectCounts project={project} />
                  <p className="flex items-center gap-1.5 text-xs text-[#7e7576] md:justify-end"><LuCalendarDays aria-hidden className="size-3.5" />{dateFormatter.format(project.updatedAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
