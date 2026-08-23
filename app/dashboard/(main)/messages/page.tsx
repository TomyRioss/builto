import Link from "next/link";
import { redirect } from "next/navigation";
import { LuMessageSquareOff } from "react-icons/lu";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TicketChat } from "@/components/tickets/ticket-chat";
import { getTicketChat } from "@/lib/tickets/chat";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const relativeFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "short" });
const timeFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit" });

function when(date: Date) {
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay ? timeFmt.format(date) : relativeFmt.format(date);
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ ticket?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { ticket: selectedTicketId } = await searchParams;

  const conversations = (
    await prisma.conversation.findMany({
      where: { kind: "TICKET", ticket: { createdById: session.user.id } },
      select: {
        id: true,
        ticketId: true,
        ticket: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderKind: true, createdAt: true } },
      },
      orderBy: { updatedAt: "desc" },
    })
  ).filter((conversation) => conversation.messages.length > 0);

  const selected = selectedTicketId ? conversations.find((conversation) => conversation.ticketId === selectedTicketId) : undefined;
  const chat = selected ? await getTicketChat(selected.ticketId!) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <div className={cn("flex w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] md:w-80 md:border-b-0 md:border-r", selected && "hidden md:flex")}>
        <div className="border-b border-[#cfc4c5] px-6 py-5">
          <h1 className="text-base font-medium leading-6">Mensajes</h1>
          <p className="mt-1 text-sm leading-5 text-[#7e7576]">Conversaciones sobre tus tickets</p>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-[#cfc4c5] overflow-y-auto">
          {conversations.length === 0 && <li className="px-6 py-8 text-sm leading-5 text-[#7e7576]">Todavia no tenes mensajes. Se crean al preguntar detalles en un ticket.</li>}
          {conversations.map((conversation) => {
            const last = conversation.messages[0];
            const active = conversation.ticketId === selectedTicketId;
            const initials = conversation.ticket!.title.slice(0, 2).toUpperCase();
            return (
              <li key={conversation.id}>
                <Link href={`/dashboard/messages?ticket=${conversation.ticketId}`} className={cn("flex w-full items-start gap-3 px-6 py-5 text-left", active ? "bg-[#edeeef]" : "hover:bg-[#f3f4f5]")}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e1e3e4] text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546]">{initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium leading-5">{conversation.ticket!.title}</span>
                      <span className="shrink-0 text-xs text-[#7e7576]">{when(last.createdAt)}</span>
                    </span>
                    <span className="mt-1 block truncate text-sm leading-5 text-[#4c4546]">{last.senderKind === "USER" ? "Vos: " : ""}{last.body}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !selected && "hidden md:flex")}>
        {selected && chat ? (
          <>
            <div className="flex items-center gap-3 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-4 md:px-8">
              <Link href="/dashboard/messages" className="text-sm font-medium text-[#4648d4] md:hidden">Atras</Link>
              <h1 className="truncate text-base font-medium leading-6">{selected.ticket!.title}</h1>
            </div>
            <div className="min-h-0 flex-1">
              <TicketChat ticketId={selected.ticketId!} messages={chat.messages} viewerIsStaff={false} />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <LuMessageSquareOff className="size-6 text-[#7e7576]" aria-hidden />
            <p className="text-sm font-medium leading-5">Elegi una conversacion</p>
            <p className="text-sm leading-5 text-[#7e7576]">Tus mensajes con Builto aparecen a la izquierda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
