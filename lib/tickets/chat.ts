import { prisma } from "@/lib/prisma";

/** Conversacion 1:1 ticket-cliente-admin. Se crea al primer mensaje, nunca antes. */
export async function getOrCreateTicketConversation(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true, projectId: true, createdById: true },
  });
  if (!ticket) return null;

  let conversation = await prisma.conversation.findFirst({
    where: { ticketId, kind: "TICKET" },
    select: { id: true },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { kind: "TICKET", ticketId, projectId: ticket.projectId, purpose: "Chat del ticket" },
      select: { id: true },
    });
  }
  await prisma.conversationParticipant.createMany({
    data: [{ conversationId: conversation.id, userId: ticket.createdById }],
    skipDuplicates: true,
  });
  return conversation;
}

export async function getTicketChat(ticketId: string) {
  const conversation = await getOrCreateTicketConversation(ticketId);
  if (!conversation) return null;
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderKind: true, createdAt: true, sender: { select: { name: true, email: true } } },
  });
  return { conversationId: conversation.id, messages };
}
