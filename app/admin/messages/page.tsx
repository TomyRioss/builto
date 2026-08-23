import Link from "next/link";
import { MessageSquareOff } from "lucide-react";
import { TicketChat } from "@/components/tickets/ticket-chat";
import { getAdminConversations } from "@/lib/admin/queries";
import { getTicketChat } from "@/lib/tickets/chat";
import { ADMIN_TICKET_STATUS } from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const relativeFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "short" });
const timeFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit" });

function when(date: Date) {
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? timeFmt.format(date) : relativeFmt.format(date);
}

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ ticket?: string }> }) {
  const { ticket: selectedTicketId } = await searchParams;
  const conversations = (await getAdminConversations()).filter((conversation) => conversation.ticket && conversation.messages.length > 0);
  const selected = selectedTicketId ? conversations.find((conversation) => conversation.ticketId === selectedTicketId) : undefined;
  const chat = selected ? await getTicketChat(selected.ticketId!) : null;

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col lg:h-svh lg:flex-row">
      <div className={cn("flex w-full shrink-0 flex-col border-[#e1e3e4] lg:w-80 lg:border-r", selected && "hidden lg:flex")}>
        <div className="shrink-0 border-b border-[#e1e3e4] px-6 py-5">
          <h1 className="text-lg font-semibold text-[#191c1d]">Mensajes</h1>
          <p className="mt-1 text-sm text-[#7e7576]">{conversations.length} conversaciones con clientes</p>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-[#f3f4f5] overflow-y-auto">
          {conversations.length === 0 && (
            <li className="px-6 py-8 text-sm text-[#7e7576]">Todavia no hay conversaciones.</li>
          )}
          {conversations.map((conversation) => {
            const last = conversation.messages[0];
            const active = conversation.ticketId === selectedTicketId;
            return (
              <li key={conversation.id}>
                <Link
                  href={`/admin/messages?ticket=${conversation.ticketId}`}
                  className={cn("block px-6 py-4 hover:bg-[#f8f9fa]", active && "bg-[#eef2ff]")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-[#191c1d]">{conversation.ticket!.title}</span>
                    <span className="shrink-0 text-xs text-[#7e7576]">{when(last.createdAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-[#4c4546]">{conversation.ticket!.createdBy.name ?? conversation.ticket!.createdBy.email}</p>
                  <p className="mt-1 truncate text-sm text-[#7e7576]">{last.senderKind === "ADMIN" ? "Vos: " : ""}{last.body}</p>
                  <span className="mt-2 inline-flex rounded bg-[#edeeef] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#4c4546]">{ADMIN_TICKET_STATUS[conversation.ticket!.status]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !selected && "hidden lg:flex")}>
        {selected && chat ? (
          <>
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e1e3e4] px-6 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#191c1d]">{selected.ticket!.title}</h2>
                <p className="text-xs text-[#7e7576]">{selected.ticket!.createdBy.name ?? selected.ticket!.createdBy.email}</p>
              </div>
              <Link href={`/admin/tickets/${selected.ticketId}`} className="shrink-0 text-sm font-medium text-[#4648d4]">Ver ticket</Link>
            </header>
            <div className="min-h-0 flex-1">
              <TicketChat ticketId={selected.ticketId!} messages={chat.messages} viewerIsStaff />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <MessageSquareOff className="size-6 text-[#7e7576]" aria-hidden />
            <p className="text-sm font-medium text-[#191c1d]">Elegi una conversacion</p>
            <p className="text-sm text-[#7e7576]">Los mensajes con clientes aparecen a la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
