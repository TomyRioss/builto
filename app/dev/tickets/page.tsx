import { CheckCircle2, ClipboardList, Filter, Search, Timer, UserCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TicketsTable } from "@/components/dev/tickets/tickets-table";
import { getDeveloperTickets } from "@/lib/dev/tickets";
import { isStaff } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const FILTER_STATUSES = ["PAID", "IN_PROGRESS", "REVIEW", "DONE"] as const;
const STATUS_OPTIONS = [
  { value: "PAID", label: "Asignado" },
  { value: "IN_PROGRESS", label: "En desarrollo" },
  { value: "REVIEW", label: "En revision" },
  { value: "DONE", label: "Completado" },
] as const;

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function DeveloperTicketsPage(props: PageProps<"/dev/tickets">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const searchParams = await props.searchParams;
  const query = param(searchParams.q).toLocaleLowerCase("es");
  const requestedStatus = param(searchParams.status);
  const status = FILTER_STATUSES.find((item) => item === requestedStatus);
  const projectId = param(searchParams.project);
  const tickets = await getDeveloperTickets(session.user.id);

  const projects = [...new Map(tickets.map((ticket) => [ticket.projectId, ticket.project.name])).entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const filtered = tickets.filter((ticket) => {
    const searchable = `${ticket.title} ${ticket.description} ${ticket.project.name}`.toLocaleLowerCase("es");
    return (!query || searchable.includes(query)) && (!status || ticket.status === status) && (!projectId || ticket.projectId === projectId);
  });
  const counts = {
    assigned: tickets.filter((ticket) => ticket.status === "PAID").length,
    working: tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
    review: tickets.filter((ticket) => ticket.status === "REVIEW").length,
    done: tickets.filter((ticket) => ticket.status === "DONE").length,
  };
  const stats = [
    { label: "Asignados", value: counts.assigned, icon: UserCheck, color: "text-[#4648d4] bg-[#eef0ff]" },
    { label: "En desarrollo", value: counts.working, icon: Timer, color: "text-blue-700 bg-blue-50" },
    { label: "En revision", value: counts.review, icon: ClipboardList, color: "text-orange-700 bg-orange-50" },
    { label: "Completados", value: counts.done, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Mis Tickets</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Segui el trabajo que tenes asignado y entra al detalle para gestionar cada ticket.</p></header>

      <section aria-label="Resumen de tickets" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, ...item }) => <div key={item.label} className="rounded-lg border border-[#d9dadb] bg-white p-5"><span className={`grid size-9 place-items-center rounded-md ${item.color}`}><Icon aria-hidden="true" className="size-4" /></span><p className="mt-5 text-2xl font-semibold text-black">{item.value}</p><p className="mt-1 text-sm text-[#666768]">{item.label}</p></div>)}
      </section>

      <form className="mt-8 grid gap-3 border-y border-[#e1e3e4] py-4 md:grid-cols-[minmax(16rem,1fr)_13rem_14rem_auto]" role="search">
        <label className="relative"><span className="sr-only">Buscar tickets</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777879]" /><input type="search" name="q" defaultValue={param(searchParams.q)} placeholder="Buscar ticket o proyecto" className="h-11 w-full rounded-md border border-[#d9dadb] bg-white pl-10 pr-3 text-sm outline-none placeholder:text-[#8a8b8c] focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]" /></label>
        <label><span className="sr-only">Filtrar por estado</span><select name="status" defaultValue={status ?? ""} className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]"><option value="">Todos los estados</option>{STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label><span className="sr-only">Filtrar por proyecto</span><select name="project" defaultValue={projectId} className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#daddff]"><option value="">Todos los proyectos</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"><Filter aria-hidden="true" className="size-4" />Filtrar</button>
      </form>

      <div className="mt-7"><div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold text-black">Tickets asignados</h2><p className="mt-1 text-sm text-[#666768]">Ordenados por ultima actividad.</p></div><p className="text-sm text-[#666768]">{filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}</p></div><TicketsTable tickets={filtered} currentDeveloperId={session.user.id} showProject /></div>
    </div>
  );
}
