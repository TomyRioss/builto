import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, FolderOpen, Search, Tickets } from "lucide-react";
import { auth } from "@/auth";
import { getDevDashboard } from "@/lib/dev/dashboard";
import { getDeveloperTicketLabel } from "@/lib/dev/ticket-workflow";
import { isStaff } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DeveloperDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const data = await getDevDashboard(session.user.id);
  const firstName = session.user.name?.trim().split(/\s+/)[0] || "Developer";
  const stats = [
    { label: "Proyectos disponibles", value: data.availableProjects, helper: "Con tickets abiertos", icon: FolderOpen, href: "/dev/projects", accent: "bg-[#eef0ff] text-[#4648d4]" },
    { label: "Mis tickets activos", value: data.assignedActive, helper: "Pagados o en desarrollo", icon: ClipboardList, href: "/dev/tickets", accent: "bg-[#fff8e7] text-[#8a5a00]" },
    { label: "En revision", value: data.assignedReview, helper: "Esperando aprobacion", icon: Search, href: "/dev/tickets?status=REVIEW", accent: "bg-[#f3f4f5] text-[#4c4546]" },
    { label: "Completados", value: data.completed, helper: "Tickets finalizados", icon: CheckCircle2, href: "/dev/tickets?status=DONE", accent: "bg-[#ecf9f1] text-[#187342]" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Bienvenido, {firstName}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Revisa tus tickets activos y encuentra nuevos proyectos para colaborar.</p></div><Link href="/dev/projects" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">Explorar proyectos <ArrowRight aria-hidden="true" className="size-4" /></Link></header>

      <section aria-labelledby="dev-summary" className="mt-10"><h2 id="dev-summary" className="sr-only">Resumen del trabajo</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ icon: Icon, ...stat }) => <Link key={stat.label} href={stat.href} className="rounded-lg border border-[#d9dadb] bg-white p-5 transition-[border-color,box-shadow] hover:border-[#b9babb] hover:shadow-[0_16px_34px_-28px_rgba(15,23,42,0.5)]"><span className={`grid size-10 place-items-center rounded-lg ${stat.accent}`}><Icon aria-hidden="true" className="size-[1.1rem]" /></span><p className="mt-6 text-3xl font-semibold text-black">{stat.value}</p><p className="mt-1 text-sm font-medium text-[#353839]">{stat.label}</p><p className="mt-2 text-xs leading-5 text-[#777879]">{stat.helper}</p></Link>)}</div></section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section className="rounded-lg border border-[#d9dadb] bg-white"><div className="border-b border-[#e1e3e4] p-5 sm:p-6"><h2 className="text-lg font-semibold text-black">Mis tickets recientes</h2><p className="mt-1 text-sm text-[#666768]">Trabajo asignado y actividad pendiente.</p></div>{data.recentAssigned.length === 0 ? <div className="px-6 py-14 text-center"><Tickets aria-hidden="true" className="mx-auto size-6 text-[#777879]" /><p className="mt-3 text-sm font-medium text-black">Todavia no tenes tickets asignados</p><p className="mt-1 text-xs leading-5 text-[#777879]">Explora los proyectos disponibles para encontrar trabajo.</p></div> : <ul className="divide-y divide-[#eceeef]">{data.recentAssigned.map((ticket) => <li key={ticket.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f3f4f5] text-[#4c4546]"><ClipboardList aria-hidden="true" className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-black">{ticket.title}</p><p className="mt-1 truncate text-xs text-[#777879]">{ticket.project.name}</p></div><span className="shrink-0 rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#4648d4]">{getDeveloperTicketLabel(ticket.status, session.user.id, session.user.id)}</span></li>)}</ul>}</section>

        <section className="rounded-lg border border-[#d9dadb] bg-white"><div className="border-b border-[#e1e3e4] p-5 sm:p-6"><h2 className="text-lg font-semibold text-black">Oportunidades</h2><p className="mt-1 text-sm text-[#666768]">Proyectos con tickets libres.</p></div>{data.recentAvailable.length === 0 ? <div className="px-6 py-14 text-center"><FolderOpen aria-hidden="true" className="mx-auto size-6 text-[#777879]" /><p className="mt-3 text-sm font-medium text-black">No hay proyectos disponibles</p><p className="mt-1 text-xs leading-5 text-[#777879]">Las nuevas solicitudes apareceran aca.</p></div> : <ul className="divide-y divide-[#eceeef]">{data.recentAvailable.map((project) => <li key={project.id}><Link href={`/dev/projects/${project.id}`} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f8f9fa] sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-black">{project.name}</p><p className="mt-1 text-xs text-[#777879]">{project._count.tickets} {project._count.tickets === 1 ? "ticket disponible" : "tickets disponibles"}</p></div><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[#777879] transition-transform group-hover:translate-x-0.5" /></Link></li>)}</ul>}</section>
      </div>
    </div>
  );
}
