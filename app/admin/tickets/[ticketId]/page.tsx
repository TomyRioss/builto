/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { ArchiveTicketButton, AskDetailsLink, ManualStatusForm } from "@/components/admin/admin-action-button";
import { DeveloperAssignment } from "@/components/admin/developer-assignment";
import { QuoteForm } from "@/components/admin/quote-form";
import { getAdminTicket, getAssignableDevelopers } from "@/lib/admin/queries";
import { ADMIN_TICKET_STATUS, money } from "@/lib/admin/status";
import { signAttachmentUrls } from "@/lib/storage/ticket-attachments";
import { getReviewStage } from "@/lib/tickets/review";

export const dynamic = "force-dynamic";
const QUOTABLE = new Set(["PENDING", "CLARIFYING", "QUOTED"]);
const date = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", dateStyle: "medium", timeStyle: "short" });

export default async function AdminTicketDetailPage(props: PageProps<"/admin/tickets/[ticketId]">) {
  const { ticketId } = await props.params;
  const [ticket, developers] = await Promise.all([getAdminTicket(ticketId), getAssignableDevelopers()]);
  if (!ticket) notFound();
  const reviewStage = ticket.status === "REVIEW" ? await getReviewStage(ticket.id) : null;

  let signed: Record<string, string> = {};
  try {
    if (ticket.attachments.length) signed = await signAttachmentUrls(ticket.attachments.map((item) => item.storageKey));
  } catch (error) {
    console.error("[admin-ticket] no se pudieron firmar adjuntos", { ticketId, message: error instanceof Error ? error.message : String(error) });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]"><ArrowLeft className="size-4" />Volver a tickets</Link>
      <header className="mt-7 border-b border-[#e1e3e4] pb-7">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#4648d4]">{ADMIN_TICKET_STATUS[ticket.status]}</span><span className="text-xs text-[#777879]">#{ticket.id.slice(-6).toUpperCase()}</span></div>
        <h1 className="mt-3 text-3xl font-semibold">{ticket.title}</h1>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#666768]"><span className="inline-flex items-center gap-2"><UserRound className="size-4" />{ticket.createdBy.name ?? ticket.createdBy.email}</span><span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{date.format(ticket.createdAt)}</span><span>Proyecto: {ticket.project.name}</span></div>
      </header>

      {ticket.status === "REVIEW" && <section className="mt-7 flex flex-col gap-4 rounded-lg border border-[#c9caff] bg-[#fafaff] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{reviewStage === "ADMIN" ? "Revision interna pendiente" : "Esperando revision del cliente"}</h2><p className="mt-1 text-sm text-[#666768]">{reviewStage === "ADMIN" ? "Comprueba el resultado y la estructura antes de habilitarlo al cliente." : "La entrega ya fue aprobada internamente."}</p></div><Link href={`/admin/tickets/${ticket.id}/review`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-5 text-sm font-medium text-white"><Eye className="size-4" />Ver entrega</Link></section>}

      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.7fr)]">
        <main className="space-y-7">
          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Solicitud del cliente</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#4c4546]">{ticket.description}</p>
            {ticket.attachments.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-2">{ticket.attachments.map((attachment) => signed[attachment.storageKey] ? <a key={attachment.id} href={signed[attachment.storageKey]} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-[#e1e3e4]"><img src={signed[attachment.storageKey]} alt="Referencia enviada por el cliente" className="aspect-video w-full object-cover" /></a> : <div key={attachment.id} className="grid aspect-video place-items-center rounded-md border border-[#e1e3e4] bg-[#f8f9fa] text-sm text-[#777879]">Imagen no disponible</div>)}</div>}
          </section>

          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Historial de cotizaciones</h2>
            {ticket.quotes.length === 0 ? <p className="mt-4 text-sm text-[#666768]">Todavia no se emitieron cotizaciones.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#e1e3e4] text-xs uppercase text-[#777879]"><tr><th className="py-3">Fecha</th><th>Importe</th><th>Tiempo</th><th>Estado</th><th>Notas</th></tr></thead><tbody className="divide-y divide-[#eceeef]">{ticket.quotes.map((quote) => <tr key={quote.id}><td className="py-4">{date.format(quote.createdAt)}</td><td>{money(quote.amount)}</td><td>{quote.estimatedDays ? `${quote.estimatedDays} dias habiles` : "-"}</td><td>{quote.status}</td><td className="max-w-56 truncate">{quote.notes ?? "-"}</td></tr>)}</tbody></table></div>}
          </section>
        </main>

        <aside className="space-y-7">
          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Mensajes</h2>
            <p className="mt-1 text-sm leading-5 text-[#666768]">Chat directo con el cliente, visible para ambos.</p>
            <div className="mt-4"><AskDetailsLink ticketId={ticket.id} /></div>
          </section>

          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Gestion comercial</h2>
            {QUOTABLE.has(ticket.status) ? <div className="mt-5"><QuoteForm ticketId={ticket.id} /></div> : <p className="mt-4 text-sm leading-6 text-[#666768]">Este ticket ya avanzo y no admite una nueva cotizacion en su estado actual.</p>}
          </section>

          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Estado y archivo</h2>
            <p className="mt-1 text-sm leading-5 text-[#666768]">Cambio manual para destrabar tickets, y archivado cuando ya no aplica.</p>
            <div className="mt-4"><ManualStatusForm ticketId={ticket.id} currentStatus={ticket.status} /></div>
            {ticket.status !== "CANCELLED" && <div className="mt-3"><ArchiveTicketButton ticketId={ticket.id} /></div>}
          </section>

          <section className="rounded-lg border border-[#d9dadb] p-6">
            <h2 className="text-lg font-semibold">Asignacion tecnica</h2>
            {ticket.status === "PAID" ? <div className="mt-4"><DeveloperAssignment ticketId={ticket.id} developers={developers} currentDeveloperId={ticket.assignedDevId} /></div> : <p className="mt-3 text-sm leading-6 text-[#666768]">La asignacion se habilita cuando el pago esta confirmado.</p>}
            <dl className="mt-5 space-y-4 border-t border-[#eceeef] pt-5 text-sm"><div><dt className="text-[#777879]">Developer actual</dt><dd className="mt-1 font-medium">{ticket.assignedDev?.name ?? ticket.assignedDev?.email ?? "Sin asignar"}</dd></div><div><dt className="text-[#777879]">Pagos registrados</dt><dd className="mt-1 font-medium">{ticket.transactions.length}</dd></div></dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
