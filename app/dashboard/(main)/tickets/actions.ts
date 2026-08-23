"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import {
  MAX_FILES,
  removeTicketAttachments,
  uploadTicketAttachments,
} from "@/lib/storage/ticket-attachments";

export type ActionState = { ok: boolean; error: string | null; quoteId?: string; conversationId?: string };

/** Estados en los que el cliente todavia puede dar de baja el ticket. */
const CANCELABLE: TicketStatus[] = ["PENDING", "CLARIFYING", "QUOTED"];

const openSchema = z.object({
  projectId: z.string().min(1, "Elegi un proyecto."),
  title: z
    .string()
    .trim()
    .min(4, "El titulo necesita al menos 4 caracteres.")
    .max(120, "El titulo no puede pasar los 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "Contanos un poco mas: minimo 10 caracteres.")
    .max(5000, "La descripcion no puede pasar los 5000 caracteres."),
});

export async function openTicket(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = openSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { projectId, title, description } = parsed.data;

  try {
    // El proyecto tiene que ser del usuario: sin esto cualquiera abre tickets
    // en proyectos ajenos mandando otro projectId.
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
      select: { id: true },
    });

    if (!project) {
      return { ok: false, error: "Ese proyecto no es tuyo." };
    }

    // Imagenes de referencia: opcionales. El cliente ya las comprime a webp.
    const files = formData
      .getAll("attachments")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length > MAX_FILES) {
      return { ok: false, error: `Podes adjuntar hasta ${MAX_FILES} imagenes.` };
    }

    const ticket = await prisma.ticket.create({
      data: {
        projectId,
        createdById: session.user.id,
        title,
        description,
      },
      select: { id: true },
    });

    if (files.length > 0) {
      let uploaded;
      try {
        uploaded = await uploadTicketAttachments({
          ticketId: ticket.id,
          uploaderId: session.user.id,
          files,
        });
      } catch (error) {
        // El ticket ya existe: no lo perdemos por una imagen que no subio.
        console.error("[tickets] fallo la subida de adjuntos", {
          userId: session.user.id,
          ticketId: ticket.id,
          count: files.length,
          error,
        });
        revalidatePath("/dashboard/tickets");
        return {
          ok: false,
          error:
            error instanceof Error
              ? `Abrimos el ticket pero no pudimos subir las imagenes: ${error.message}`
              : "Abrimos el ticket pero no pudimos subir las imagenes.",
        };
      }

      try {
        await prisma.ticketAttachment.createMany({
          data: uploaded.map((file) => ({
            ticketId: ticket.id,
            uploaderId: session.user.id,
            ...file,
          })),
        });
      } catch (error) {
        // Sin fila en la base el binario no lo lista nadie: lo sacamos.
        await removeTicketAttachments(uploaded.map((f) => f.storageKey));
        throw error;
      }
    }
  } catch (error) {
    console.error("[tickets] fallo al abrir ticket", {
      userId: session.user.id,
      projectId,
      title,
      error,
    });
    return { ok: false, error: "No pudimos abrir el ticket. Proba de nuevo." };
  }

  revalidatePath("/dashboard/tickets");
  return { ok: true, error: null };
}

export async function cancelTicket(ticketId: string): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  try {
    const { count } = await prisma.ticket.updateMany({
      where: {
        id: ticketId,
        createdById: session.user.id,
        status: { in: CANCELABLE },
      },
      data: { status: "CANCELLED" },
    });

    if (count === 0) {
      return { ok: false, error: "Este ticket ya no se puede cancelar." };
    }
  } catch (error) {
    console.error("[tickets] fallo al cancelar ticket", {
      userId: session.user.id,
      ticketId,
      error,
    });
    return { ok: false, error: "No pudimos cancelar el ticket." };
  }

  revalidatePath("/dashboard/tickets");
  return { ok: true, error: null };
}

/** Respuesta del cliente a la cotizacion vigente (la ultima SENT). */
export async function respondQuote(
  ticketId: string,
  accept: boolean,
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  let acceptedQuoteId: string | undefined;

  try {
    const quote = await prisma.quote.findFirst({
      where: {
        ticketId,
        status: "SENT",
        ticket: { createdById: session.user.id, status: "QUOTED" },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, expiresAt: true },
    });

    if (!quote) {
      return { ok: false, error: "No hay una cotizacion vigente para responder." };
    }

    if (quote.expiresAt && quote.expiresAt < new Date()) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: "EXPIRED" },
      });
      return { ok: false, error: "La cotizacion vencio. Pedi una nueva." };
    }

    if (accept) acceptedQuoteId = quote.id;

    // Cotizacion y ticket se mueven juntos o no se mueve ninguno.
    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quote.id },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: accept ? "quote.accepted" : "quote.rejected",
          entityType: "Quote",
          entityId: quote.id,
          meta: { ticketId },
        },
      }),
    ]);
  } catch (error) {
    console.error("[tickets] fallo al responder la cotizacion", {
      userId: session.user.id,
      ticketId,
      accept,
      error,
    });
    return { ok: false, error: "No pudimos registrar tu respuesta." };
  }

  revalidatePath("/dashboard/tickets");
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/quotes");
  return { ok: true, error: null, quoteId: acceptedQuoteId };
}

/**
 * Checkout del MVP: simula una acreditacion de Mercado Pago sin contactar
 * ningun proveedor ni procesar datos financieros reales.
 */
export async function simulateQuotePayment(quoteId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  try {
    await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findFirst({
        where: {
          id: quoteId,
          status: "ACCEPTED",
          ticket: { createdById: session.user.id, status: "ACCEPTED" },
        },
        select: {
          id: true,
          ticketId: true,
          amount: true,
          currency: true,
        },
      });

      if (!quote) throw new Error("QUOTE_NOT_PAYABLE");

      const moved = await tx.ticket.updateMany({
        where: {
          id: quote.ticketId,
          createdById: session.user.id,
          status: "ACCEPTED",
        },
        data: { status: "PAID" },
      });
      if (moved.count !== 1) throw new Error("QUOTE_NOT_PAYABLE");

      const payment = await tx.transaction.create({
        data: {
          ticketId: quote.ticketId,
          quoteId: quote.id,
          userId: session.user.id,
          amount: quote.amount,
          currency: quote.currency,
          provider: "MERCADOPAGO",
          providerRef: `SIM-${crypto.randomUUID()}`,
          status: "PAID",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "payment.simulated",
          entityType: "Transaction",
          entityId: payment.id,
          meta: {
            ticketId: quote.ticketId,
            quoteId: quote.id,
            provider: "MERCADOPAGO",
            simulated: true,
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[tickets] fallo el pago simulado", {
      quoteId,
      userId: session.user.id,
      message,
    });
    return {
      ok: false,
      error: message === "QUOTE_NOT_PAYABLE"
        ? "La cotizacion ya fue pagada o dejo de estar disponible."
        : "No pudimos completar el pago simulado.",
    };
  }

  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/tickets");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/tickets");
  revalidatePath("/dev/projects");
  return { ok: true, error: null };
}

const reviewFeedbackSchema = z.string().trim().min(5, "Contale al Developer que deberia ajustar.").max(3000);

export async function openReviewAiConversation(ticketId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };
  try {
    const conversationId = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: { id: ticketId, createdById: session.user.id, status: "REVIEW" },
        select: { id: true, projectId: true },
      });
      if (!ticket) throw new Error("NOT_CLIENT_REVIEW");
      const latest = await tx.auditLog.findFirst({ where: { entityId: ticketId, action: { in: ["ticket.sent_to_review", "ticket.admin_review_approved"] } }, orderBy: { createdAt: "desc" }, select: { action: true } });
      if (latest?.action !== "ticket.admin_review_approved") throw new Error("NOT_CLIENT_REVIEW");
      let conversation = await tx.conversation.findFirst({ where: { projectId: ticket.projectId, kind: "AI" }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (!conversation) conversation = await tx.conversation.create({ data: { kind: "AI", projectId: ticket.projectId, purpose: "Ajustes solicitados durante la revision", participants: { create: { userId: session.user.id } } }, select: { id: true } });
      else await tx.conversationParticipant.createMany({ data: [{ conversationId: conversation.id, userId: session.user.id }], skipDuplicates: true });
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "ticket.review_ai_opened", entityType: "Ticket", entityId: ticketId, meta: { conversationId: conversation.id } } });
      return conversation.id;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { ok: true, error: null, conversationId };
  } catch {
    return { ok: false, error: "La entrega todavia no esta disponible para ajustes con IA." };
  }
}

export async function approveReviewedTicket(ticketId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };
  try {
    await prisma.$transaction(async (tx) => {
      const latest = await tx.auditLog.findFirst({ where: { entityId: ticketId, action: { in: ["ticket.sent_to_review", "ticket.admin_review_approved"] } }, orderBy: { createdAt: "desc" }, select: { action: true } });
      if (latest?.action !== "ticket.admin_review_approved") throw new Error("NOT_CLIENT_REVIEW");
      const moved = await tx.ticket.updateMany({ where: { id: ticketId, createdById: session.user.id, status: "REVIEW" }, data: { status: "DONE" } });
      if (moved.count !== 1) throw new Error("NOT_CLIENT_REVIEW");
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "ticket.client_review_approved", entityType: "Ticket", entityId: ticketId } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch {
    return { ok: false, error: "El ticket todavia no esta listo para tu aprobacion." };
  }
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dev/tickets");
  return { ok: true, error: null };
}

export async function requestClientReviewChanges(ticketId: string, rawFeedback: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };
  const parsed = reviewFeedbackSchema.safeParse(rawFeedback);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({ where: { id: ticketId, createdById: session.user.id, status: "REVIEW" }, select: { id: true, projectId: true, createdById: true, assignedDevId: true } });
      if (!ticket?.assignedDevId) throw new Error("NOT_CLIENT_REVIEW");
      const latest = await tx.auditLog.findFirst({ where: { entityId: ticketId, action: { in: ["ticket.sent_to_review", "ticket.admin_review_approved"] } }, orderBy: { createdAt: "desc" }, select: { action: true } });
      if (latest?.action !== "ticket.admin_review_approved") throw new Error("NOT_CLIENT_REVIEW");
      const moved = await tx.ticket.updateMany({ where: { id: ticketId, createdById: session.user.id, status: "REVIEW" }, data: { status: "IN_PROGRESS" } });
      if (moved.count !== 1) throw new Error("NOT_CLIENT_REVIEW");
      let conversation = await tx.conversation.findFirst({ where: { ticketId, kind: "TICKET" }, select: { id: true } });
      if (!conversation) conversation = await tx.conversation.create({ data: { kind: "TICKET", ticketId, projectId: ticket.projectId, purpose: "Feedback y seguimiento del ticket" }, select: { id: true } });
      await tx.conversationParticipant.createMany({ data: [ticket.createdById, ticket.assignedDevId].map((userId) => ({ conversationId: conversation.id, userId })), skipDuplicates: true });
      await tx.message.create({ data: { conversationId: conversation.id, senderId: session.user.id, senderKind: "USER", body: parsed.data, meta: { type: "REVIEW_FEEDBACK", stage: "CLIENT" } } });
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "ticket.client_changes_requested", entityType: "Ticket", entityId: ticketId, meta: { conversationId: conversation.id } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch {
    return { ok: false, error: "El ticket todavia no esta listo para recibir cambios." };
  }
  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  revalidatePath("/dev/tickets");
  revalidatePath("/dev/projects");
  return { ok: true, error: null };
}
