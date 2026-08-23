import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ActivityFeed } from "@/components/client-dashboard/activity-feed";
import { ClientActions } from "@/components/client-dashboard/client-actions";
import { NotificationMenu } from "@/components/client-dashboard/notification-menu";
import { ProjectCard } from "@/components/client-dashboard/project-card";
import { clientActivity, clientProjects } from "@/lib/client-dashboard/mock-data";

export default function ClientDashboardPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="mb-16 flex flex-col gap-6 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-black sm:text-4xl lg:text-5xl">Bienvenido, Nahuel.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Vista previa de tu espacio de trabajo y de lo que esta en desarrollo.</p></div>
        <NotificationMenu />
      </header>

      <div className="grid gap-16 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-16 lg:col-span-8 lg:space-y-20">
          <ClientActions />
          <section id="recent-projects" aria-labelledby="projects-title">
            <div className="mb-4 flex items-center justify-between gap-4"><h2 id="projects-title" className="text-xl font-medium tracking-[-0.015em] text-black">Proyectos recientes</h2><Link href="#recent-projects" className="flex items-center gap-1 text-sm font-medium text-[#4648d4] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">Ver todos <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
            <div className="grid gap-6 sm:grid-cols-2">{clientProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
          </section>
          <section id="tickets" aria-labelledby="client-tickets-title" className="rounded-lg border border-dashed border-[#d9dadb] bg-[#f8f9fa] p-6"><h2 id="client-tickets-title" className="font-medium text-black">Tickets del proyecto</h2><p className="mt-2 text-sm leading-6 text-[#4c4546]">El historial completo de tickets se incorporará cuando conectemos los datos del cliente.</p></section>
          <div id="settings" className="sr-only" aria-hidden="true">Configuración</div>
        </div>
        <div className="lg:col-span-4"><ActivityFeed activities={clientActivity} /></div>
      </div>
    </div>
  );
}
