import Link from "next/link";
import {
  LuArrowRight,
  LuBell,
  LuLayoutTemplate,
  LuListFilter,
  LuPlus,
  LuSparkles,
  LuTicket,
  LuUserSearch,
} from "react-icons/lu";

import { auth } from "@/auth";
import { listRecentProjects, type RecentProject } from "@/lib/builder/queries";
import { listActivity } from "@/lib/dashboard/activity";
import { formatRelativeTime } from "@/lib/utils";

/** Los estados de `ProjectStatus` que el usuario ve en la tarjeta. */
function StatusChip({ status }: { status: RecentProject["status"] }) {
  if (status === "ONBOARDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-[#c0c1ff] bg-[#eef2ff] px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#4648d4]">
        <LuUserSearch className="size-3" aria-hidden />
        Setup
      </span>
    );
  }

  if (status === "READY") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-[#e1e3e4] px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#000000]">
        <span className="size-1.5 rounded-full bg-[#000000]" aria-hidden />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded bg-[#e1e3e4] px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#000000]">
      Draft
    </span>
  );
}

function ProjectCard({ project }: { project: RecentProject }) {
  const href = project.conversationId
    ? `/dashboard/builder/${project.conversationId}`
    : "/dashboard/builder";

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#ffffff] transition-all hover:border-[#7e7576] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)]"
    >
      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden border-b border-[#e1e3e4] bg-[#f3f4f5] text-[#cfc4c5]">
        {project.thumbnail ? (
          // dataURL guardado en la DB: next/image no aporta nada aca y ademas
          // no optimiza data URIs.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail}
            alt={`Captura de ${project.name}`}
            className="size-full object-cover object-top"
          />
        ) : (
          <LuLayoutTemplate className="size-8" aria-hidden />
        )}
        <div className="absolute right-3 top-3">
          <StatusChip status={project.status} />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="text-base font-medium leading-6 text-[#000000] transition-colors group-hover:text-[#4648d4]">
          {project.name}
        </h3>
        <p className="text-sm leading-5 text-[#4c4546]">
          Editado {formatRelativeTime(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  // El layout del dashboard ya exige sesion; si igual no hay, la seccion queda
  // en su estado vacio en vez de reventar.
  const [projects, activity] = session?.user?.id
    ? await Promise.all([
        listRecentProjects(session.user.id),
        listActivity(session.user.id),
      ])
    : [[], []];

  // `User.name` guarda el nombre completo, no nombre y apellido por separado.
  const nombre = session?.user?.name?.trim();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-10 md:py-10">
      {/* Header bienvenida */}
      <header className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.01em] text-[#000000] md:text-5xl md:leading-[56px] md:tracking-[-0.02em]">
            {nombre ? `Bienvenido de nuevo, ${nombre}.` : "Bienvenido de nuevo."}
          </h1>
          <p className="mt-2 max-w-[65ch] text-base leading-6 text-[#4c4546]">
            Vista previa de tu espacio de trabajo y de lo que esta en desarrollo.
          </p>
        </div>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e1e3e4] text-[#4c4546] hover:bg-[#f3f4f5] hover:text-[#000000]"
          aria-label="Notificaciones"
        >
          <LuBell className="size-4" aria-hidden />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-20 lg:col-span-8">
          {/* Acciones */}
          <section>
            <h2 className="mb-4 text-xl font-medium leading-7 tracking-[0.01em] text-[#000000]">
              Acciones
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                href="/dashboard/builder"
                className="flex h-40 flex-col justify-between rounded-lg bg-[#6063ee] p-6 text-left transition-opacity hover:opacity-95"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-white/20 text-[#ffffff]">
                  <LuPlus className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-base font-medium leading-6 text-[#ffffff]">
                    Crear nuevo proyecto
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-[#ffffff]/80">
                    Empeza un nuevo chat con la IA.
                  </span>
                </span>
              </Link>

              <Link
                href="/dashboard/builder"
                className="group flex h-40 flex-col justify-between rounded-lg border border-[#e1e3e4] bg-[#ffffff] p-6 text-left transition-colors hover:border-[#7e7576]"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#f3f4f5] text-[#000000] transition-colors group-hover:bg-[#e1e3e4]">
                  <LuLayoutTemplate className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-base font-medium leading-6 text-[#000000]">
                    Libreria de plantillas
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-[#4c4546]">
                    Pre construcciones listas para usar.
                  </span>
                </span>
              </Link>
            </div>
          </section>

          {/* Proyectos recientes */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium leading-7 tracking-[0.01em] text-[#000000]">
                Proyectos recientes
              </h2>
              <Link
                href="/dashboard/builder"
                className="inline-flex items-center gap-1 text-sm leading-5 text-[#4648d4] hover:underline"
              >
                Ver todos
                <LuArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-[#e1e3e4] bg-[#ffffff] p-10">
                <p className="max-w-[65ch] text-sm leading-5 text-[#4c4546]">
                  Todavia no tenes proyectos. Crea uno y la IA le va a poner nombre
                  sola mientras lo construis.
                </p>
                <Link
                  href="/dashboard/builder"
                  className="inline-flex items-center gap-1 text-sm font-medium leading-5 text-[#4648d4] hover:underline"
                >
                  Crear el primero
                  <LuArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Columna derecha: actividad */}
        <div className="mt-20 lg:col-span-4 lg:mt-0">
          <aside className="flex flex-col lg:sticky lg:top-10 lg:h-[calc(100dvh-153px)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium leading-7 tracking-[0.01em] text-[#000000]">
                Actividad
              </h2>
              <button
                type="button"
                className="p-1 text-[#4c4546] hover:text-[#000000]"
                aria-label="Filtrar actividad"
              >
                <LuListFilter className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#e1e3e4] bg-[#ffffff]">
              {activity.length === 0 ? (
                <p className="p-4 text-sm leading-5 text-[#4c4546]">
                  Todavia no hay actividad. Va a aparecer cuando la IA escriba tu
                  sitio o abras un ticket.
                </p>
              ) : (
                <ul className="flex-1 divide-y divide-[#e1e3e4] overflow-y-auto">
                  {activity.map((item) => {
                    const Icon = item.kind === "ai" ? LuSparkles : LuTicket;

                    return (
                      <li key={item.id} className="p-4 transition-colors hover:bg-[#f3f4f5]">
                        <div className="flex gap-4">
                          <span
                            className={
                              "flex size-8 shrink-0 items-center justify-center rounded-full " +
                              (item.kind === "ai"
                                ? "bg-[#eef2ff] text-[#4648d4]"
                                : "bg-[#e1e3e4] text-[#4c4546]")
                            }
                          >
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm leading-5 text-[#000000]">{item.text}</p>
                            <p className="mt-2 text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#4c4546]">
                              {formatRelativeTime(item.at)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
