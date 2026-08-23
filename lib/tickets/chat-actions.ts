"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { getOrCreateTicketConversation } from "@/lib/tickets/chat";

export type ChatActionState = { ok: boolean; error: string | null };

const bodySchema = z.string().trim().min(1, "Escribi un mensaje.").max(3000);

export async function sendTicketMessage(ticketId: string, rawBody: string): Promise<ChatActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Sesion invalida." };
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const staff = isStaff(session.user.role);
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { id: true, createdById: true } });
  if (!ticket) return { ok: false, error: "El ticket no existe." };
  if (!staff && ticket.createdById !== session.user.id) return { ok: false, error: "No tenes acceso a este ticket." };

  try {
    const conversation = await getOrCreateTicketConversation(ticketId);
    if (!conversation) return { ok: false, error: "El ticket no existe." };
    await prisma.message.create({
      data: { conversationId: conversation.id, senderId: session.user.id, senderKind: staff ? "ADMIN" : "USER", body: parsed.data },
    });
  } catch (error) {
    console.error("[tickets] fallo al enviar mensaje", { ticketId, message: error instanceof Error ? error.message : String(error) });
    return { ok: false, error: "No pudimos enviar el mensaje." };
  }

  revalidatePath(`/admin/tickets/${ticketId}/chat`);
  revalidatePath(`/dashboard/tickets/${ticketId}/chat`);
  return { ok: true, error: null };
}
