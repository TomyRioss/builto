import { FiClipboard, FiCheckCircle } from "react-icons/fi";

interface TicketsStatsProps {
  activos: number;
  completadosMes: number;
}

export function TicketsStats({ activos, completadosMes }: TicketsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Tickets activos" value={activos} icon={<FiClipboard className="h-4 w-4 text-blue-600" />} />
      <StatCard
        label="Completados (mes)"
        value={completadosMes}
        icon={<FiCheckCircle className="h-4 w-4 text-emerald-600" />}
      />
      <div className="hidden rounded-lg border border-neutral-200 bg-neutral-50/60 sm:block" aria-hidden />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-neutral-500">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-neutral-900">{value}</p>
    </div>
  );
}
