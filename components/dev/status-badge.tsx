import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { getDeveloperTicketLabel } from "@/lib/dev/ticket-workflow";

const STATUS_CONFIG: Record<string, { dot: string; text: string; bg: string }> = {
  Disponible: { dot: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50" },
  "Asignado a vos": { dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" },
  Asignado: { dot: "bg-neutral-500", text: "text-neutral-700", bg: "bg-neutral-100" },
  "En desarrollo": { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  "En revision": { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
  Completado: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  "No disponible": { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-100" },
};

export function StatusBadge({ status, assignedDevId = null, currentDeveloperId }: { status: TicketStatus; assignedDevId?: string | null; currentDeveloperId?: string }) {
  const label = getDeveloperTicketLabel(status, assignedDevId, currentDeveloperId);
  const cfg = STATUS_CONFIG[label];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.03em]",
        cfg.bg,
        cfg.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden />
      {label}
    </span>
  );
}
