import { FolderKanban, MessageCircle, TicketCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentActivity as RecentActivityItem } from "@/lib/dashboard/mock-data";

const activityMeta = {
  ticket: { label: "Ticket", icon: TicketCheck, variant: "warning" as const },
  project: { label: "Proyecto", icon: FolderKanban, variant: "success" as const },
  message: { label: "Mensaje", icon: MessageCircle, variant: "info" as const },
};

export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-[#eceeef]">
        <CardTitle>Actividad reciente</CardTitle>
        <CardDescription>Ultimos movimientos en tus tickets y proyectos.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-0">
        {items.length === 0 ? (
          <div className="px-5 py-12 text-center"><p className="text-sm font-medium text-[#4c4546]">Todavia no hay actividad</p><p className="mt-1 text-xs text-[#8a8b8c]">Las novedades de tu trabajo apareceran aca.</p></div>
        ) : (
          <ul className="divide-y divide-[#eceeef]">
            {items.map((item) => {
              const meta = activityMeta[item.type];
              const Icon = meta.icon;
              return (
                <li key={item.id} className="flex gap-3 px-5 py-4 transition-colors hover:bg-[#fafafa] sm:gap-4 sm:px-6">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-[#f3f4f5] text-[#4c4546]"><Icon aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-black">{item.title}</p><time className="shrink-0 text-xs text-[#8a8b8c]">{item.occurredAt}</time></div>
                    <p className="mt-1 text-sm leading-5 text-[#666768]">{item.description}</p>
                    <Badge variant={meta.variant} className="mt-3">{meta.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
