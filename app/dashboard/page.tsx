import Link from "next/link";
import { ArrowRight, FolderKanban, MessageCircle, Timer, TicketCheck } from "lucide-react";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentDashboardUser } from "@/lib/dashboard/current-user";
import { dashboardSummary, recentActivity } from "@/lib/dashboard/mock-data";

const stats = [
  { label: "Tickets pendientes", value: dashboardSummary.pendingTickets, helper: "Esperan revisión o cotización", href: "/dashboard/tickets", icon: TicketCheck, accent: "amber" as const },
  { label: "Tickets en curso", value: dashboardSummary.activeTickets, helper: "Actualmente en desarrollo", href: "/dashboard/tickets", icon: Timer, accent: "indigo" as const },
  { label: "Proyectos activos", value: dashboardSummary.activeProjects, helper: "Con trabajo en progreso", href: "/dashboard/projects", icon: FolderKanban, accent: "emerald" as const },
  { label: "Mensajes sin leer", value: dashboardSummary.unreadMessages, helper: "Conversaciones por responder", href: "/dashboard/messages", icon: MessageCircle, accent: "slate" as const },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#6063ee]">Inicio</p>
            <Badge variant="neutral">Datos de demostración</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black sm:text-3xl">Buen día, {currentDashboardUser.name.split(" ")[0]}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#666768] sm:text-base">Revisá lo que necesita tu atención y continuá con el trabajo del día.</p>
        </div>
        <p className="text-xs text-[#8a8b8c]">Actualizado hace unos minutos</p>
      </header>

      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="sr-only">Resumen</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <SummaryCard key={stat.label} {...stat} />)}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)]">
        <RecentActivity items={recentActivity} />

        <Card>
          <CardHeader>
            <CardTitle>Próximos pasos</CardTitle>
            <CardDescription>Accesos rápidos a las áreas que necesitan seguimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <nav aria-label="Accesos rápidos">
              <ul className="space-y-2">
                {stats.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link href={item.href} className="group flex min-h-14 items-center gap-3 rounded-lg border border-[#eceeef] px-3 py-2.5 transition-colors hover:border-[#d9dadb] hover:bg-[#f8f9fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f3f4f5] text-[#4c4546]"><Icon aria-hidden="true" className="size-4" /></span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-[#353839]">{item.label}</span>
                        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[#a1a2a3] transition-transform group-hover:translate-x-0.5 group-hover:text-black" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
