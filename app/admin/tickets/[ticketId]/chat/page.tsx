import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TicketChat } from "@/components/tickets/ticket-chat";
import { getTicketChat } from "@/lib/tickets/chat";
import { getAdminTicket } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminTicketChatPage(props: PageProps<"/admin/tickets/[ticketId]/chat">) {
  const { ticketId } = await props.params;
  const [chat, ticket] = await Promise.all([getTicketChat(ticketId), getAdminTicket(ticketId)]);
  if (!chat || !ticket) notFound();

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col lg:h-svh">
      <header className="flex shrink-0 items-center gap-4 border-b border-[#e1e3e4] px-6 py-4">
        <Link href={`/admin/tickets/${ticketId}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]"><ArrowLeft className="size-4" />Ticket</Link>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-[#191c1d]">{ticket.title}</h1>
          <p className="text-xs text-[#7e7576]">{ticket.createdBy.name ?? ticket.createdBy.email}</p>
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <TicketChat ticketId={ticketId} messages={chat.messages} viewerIsStaff />
      </div>
    </div>
  );
}
