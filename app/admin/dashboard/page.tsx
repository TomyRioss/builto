import Link from "next/link";
import { ArrowRight, Banknote, CircleDollarSign, ClipboardList, Code2, SearchCheck } from "lucide-react";
import { getAdminDashboard } from "@/lib/admin/queries";
import { ADMIN_TICKET_STATUS } from "@/lib/admin/status";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();
  const stats = [
    { label: "Esperando revision", value: data.pending, icon: ClipboardList, href: "/admin/tickets?status=PENDING" },
    { label: "Cotizaciones enviadas", value: data.quoted, icon: CircleDollarSign, href: "/admin/tickets?status=QUOTED" },
    { label: "Aceptados sin pago", value: data.accepted, icon: Banknote, href: "/admin/payments" },
    { label: "Pagados sin dev", value: data.paidUnassigned, icon: Code2, href: "/admin/tickets?status=PAID" },
    { label: "En desarrollo", value: data.inProgress, icon: Code2, href: "/admin/tickets?status=IN_PROGRESS" },
    { label: "En revision", value: data.review, icon: SearchCheck, href: "/admin/tickets?status=REVIEW" },
  ];
  return <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10"><header><p className="text-sm font-medium text-[#4648d4]">Operacion Builto</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Dashboard administrativo</h1><p className="mt-3 text-sm text-[#666768]">Cotizaciones, pagos y ejecucion de tickets en un solo lugar.</p></header><section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(({ icon: Icon, ...item }) => <Link key={item.label} href={item.href} className="rounded-lg border border-[#d9dadb] bg-white p-5 hover:border-[#4648d4]"><Icon className="size-5 text-[#4648d4]" /><p className="mt-5 text-3xl font-semibold">{item.value}</p><p className="mt-1 text-sm text-[#666768]">{item.label}</p></Link>)}</section><section className="mt-8 overflow-hidden rounded-lg border border-[#d9dadb]"><div className="flex items-center justify-between border-b border-[#e1e3e4] p-5"><div><h2 className="font-semibold">Actividad reciente</h2><p className="mt-1 text-sm text-[#666768]">Ultimos tickets actualizados.</p></div><Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]">Ver todos <ArrowRight className="size-4" /></Link></div><ul className="divide-y divide-[#eceeef]">{data.recent.map((ticket) => <li key={ticket.id}><Link href={`/admin/tickets/${ticket.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f8f9fa]"><div className="min-w-0"><p className="truncate text-sm font-semibold">{ticket.title}</p><p className="mt-1 truncate text-xs text-[#777879]">{ticket.project.name} · {ticket.createdBy.name ?? ticket.createdBy.email}</p></div><span className="shrink-0 rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs text-[#4648d4]">{ADMIN_TICKET_STATUS[ticket.status]}</span></Link></li>)}</ul></section></div>;
}
