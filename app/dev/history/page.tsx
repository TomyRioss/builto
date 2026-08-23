import { History } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDeveloperHistory } from "@/lib/dev/tickets";

export const dynamic = "force-dynamic";

const date = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", dateStyle: "medium", timeStyle: "short" });

const actions: Record<string, string> = {
  "ticket.assigned": "Ticket tomado",
  "ticket.started": "Trabajo iniciado",
  "ticket.sent_to_review": "Enviado a revision",
  "ticket.admin_review_approved": "Revision interna aprobada",
  "ticket.admin_changes_requested": "Admin solicito cambios",
  "ticket.client_review_approved": "Cliente aprobo la entrega",
  "ticket.client_changes_requested": "Cliente solicito cambios",
  "ticket.status_overridden": "Estado cambiado manualmente",
};

export default async function DeveloperHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const logs = await getDeveloperHistory(session.user.id);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header>
        <p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Historial</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Actividad reciente de tus tickets y proyectos.</p>
      </header>

      {logs.length === 0 ? (
        <section className="mt-8 grid min-h-80 place-items-center border-y border-[#e1e3e4] px-6 py-16 text-center">
          <div className="max-w-md">
            <History aria-hidden="true" className="mx-auto size-7 text-[#777879]" />
            <h2 className="mt-4 text-lg font-semibold text-black">Sin actividad para mostrar</h2>
            <p className="mt-2 text-sm leading-6 text-[#666768]">Los cambios de estado y acciones realizadas sobre tus tickets se mostraran aca.</p>
          </div>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-lg border border-[#d9dadb]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs uppercase text-[#777879]">
                <tr><th className="px-5 py-3">Fecha</th><th>Accion</th><th>Por</th><th>Ticket</th></tr>
              </thead>
              <tbody className="divide-y divide-[#eceeef]">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4">{date.format(log.createdAt)}</td>
                    <td className="font-medium">{actions[log.action] ?? log.action}</td>
                    <td>{log.actor?.name ?? log.actor?.email ?? "Sistema"}</td>
                    <td className="font-mono text-xs text-[#666768]">{log.entityId.slice(-6).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
