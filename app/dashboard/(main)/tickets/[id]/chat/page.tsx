import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { TicketChat } from "@/components/tickets/ticket-chat";
import { getTicketChat } from "@/lib/tickets/chat";

export const dynamic = "force-dynamic";

export default async function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const staff = isStaff(session.user.role);
  const ticket = await prisma.ticket.findFirst({
    where: staff ? { id } : { id, createdById: session.user.id },
    select: { id: true, title: true },
  });
  if (!ticket) notFound();

  const chat = await getTicketChat(id);
  if (!chat) notFound();

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col lg:h-svh">
      <header className="flex shrink-0 items-center gap-4 border-b border-[#e1e3e4] px-6 py-4">
        <Link href={`/dashboard/tickets/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-[#4c4546] hover:text-[#191c1d]">
          <LuArrowLeft className="size-4" aria-hidden />
          Ticket
        </Link>
        <h1 className="truncate text-base font-semibold text-[#191c1d]">{ticket.title}</h1>
      </header>
      <div className="min-h-0 flex-1">
        <TicketChat ticketId={id} messages={chat.messages} viewerIsStaff={staff} />
      </div>
    </div>
  );
}
