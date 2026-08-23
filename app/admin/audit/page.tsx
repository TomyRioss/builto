import { getAdminAuditLog } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";
const date = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" });
const actions: Record<string, string> = {
  "ticket.quoted": "Cotizacion emitida",
  "ticket.clarification_requested": "Aclaracion solicitada",
  "ticket.assigned": "Ticket tomado",
  "ticket.started": "Trabajo iniciado",
  "ticket.sent_to_review": "Enviado a revision",
  "payment.confirmed": "Pago confirmado",
  "payment.simulated": "Pago simulado acreditado",
  "ticket.admin_review_approved": "Revision interna aprobada",
  "ticket.admin_changes_requested": "Admin solicito cambios",
  "ticket.client_review_approved": "Cliente aprobo la entrega",
  "ticket.client_changes_requested": "Cliente solicito cambios",
  "ticket.review_ai_opened": "Cliente abrio ajustes con IA",
};

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLog();
  return <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10"><header><p className="text-sm font-medium text-[#4648d4]">Administracion</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Auditoria</h1><p className="mt-3 text-sm text-[#666768]">Registro de acciones sensibles realizadas por staff y Developers.</p></header><section className="mt-8 overflow-hidden rounded-lg border border-[#d9dadb]"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-[#e1e3e4] bg-[#f8f9fa] text-xs uppercase text-[#777879]"><tr><th className="px-5 py-3">Fecha</th><th>Accion</th><th>Actor</th><th>Entidad</th><th>ID</th></tr></thead><tbody className="divide-y divide-[#eceeef]">{logs.map((log) => <tr key={log.id}><td className="px-5 py-4">{date.format(log.createdAt)}</td><td className="font-medium">{actions[log.action] ?? log.action}</td><td><p>{log.actor?.name ?? log.actor?.email ?? "Sistema"}</p>{log.actor && <p className="mt-1 text-xs text-[#777879]">{log.actor.role}</p>}</td><td>{log.entityType}</td><td className="font-mono text-xs text-[#666768]">{log.entityId}</td></tr>)}</tbody></table></div>{logs.length === 0 && <p className="p-12 text-center text-sm text-[#666768]">Todavia no hay acciones registradas.</p>}</section></div>;
}
