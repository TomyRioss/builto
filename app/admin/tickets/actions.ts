"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canQuote, canSeeTransactions } from "@/lib/permissions";

export type AdminActionState = { ok: boolean; error: string | null };

const quoteSchema = z.object({
  ticketId: z.string().min(1),
  amount: z.coerce.number().positive().max(999_999_999),
  currency: z.enum(["ARS", "USD"]),
  estimatedDays: z.coerce.number().int().min(1).max(365),
  notes: z.string().trim().max(3000).optional(),
  expiresAt: z.string().optional(),
});

export async function createQuote(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await auth();
  if (!session?.user || !canQuote(session.user.role)) return { ok: false, error: "No tenes permiso para cotizar." };
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const moved = await tx.ticket.updateMany({
        where: { id: data.ticketId, status: { in: ["PENDING", "CLARIFYING", "QUOTED"] } },
        data: { status: "QUOTED" },
      });
      if (moved.count !== 1) throw new Error("TICKET_NOT_QUOTABLE");
      await tx.quote.updateMany({ where: { ticketId: data.ticketId, status: "SENT" }, data: { status: "EXPIRED" } });
      const quote = await tx.quote.create({
        data: {
          ticketId: data.ticketId,
          amount: data.amount,
          currency: data.currency,
          estimatedDays: data.estimatedDays,
          notes: data.notes || null,
          expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59`) : null,
          createdById: session.user.id,
        },
      });
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "ticket.quoted", entityType: "Ticket", entityId: data.ticketId, meta: { quoteId: quote.id, amount: data.amount, currency: data.currency, estimatedDays: data.estimatedDays } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    console.error("[admin] fallo al cotizar", { ticketId: data.ticketId, message: error instanceof Error ? error.message : String(error) });
    return { ok: false, error: error instanceof Error && error.message === "TICKET_NOT_QUOTABLE" ? "El ticket cambio de estado y ya no se puede cotizar." : "No pudimos guardar la cotizacion." };
  }
  revalidatePath(`/admin/tickets/${data.ticketId}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/dashboard");
  return { ok: true, error: null };
}

export async function requestClarification(ticketId: string): Promise<AdminActionState> {
  const session = await auth();
  if (!session?.user || !canQuote(session.user.role)) return { ok: false, error: "Sin permiso." };
  const result = await prisma.ticket.updateMany({ where: { id: ticketId, status: "PENDING" }, data: { status: "CLARIFYING" } });
  if (result.count !== 1) return { ok: false, error: "El ticket ya cambio de estado." };
  await prisma.auditLog.create({ data: { actorId: session.user.id, action: "ticket.clarification_requested", entityType: "Ticket", entityId: ticketId } });
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { ok: true, error: null };
}

export async function confirmManualPayment(quoteId: string): Promise<AdminActionState> {
  const session = await auth();
  if (!session?.user || !canSeeTransactions(session.user.role)) return { ok: false, error: "No tenes permiso para confirmar pagos." };
  try {
    await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findUnique({ where: { id: quoteId }, include: { ticket: true } });
      if (!quote || quote.status !== "ACCEPTED" || quote.ticket.status !== "ACCEPTED") throw new Error("QUOTE_NOT_PAYABLE");
      const duplicate = await tx.transaction.findFirst({ where: { quoteId, status: "PAID" }, select: { id: true } });
      if (duplicate) throw new Error("ALREADY_PAID");
      const moved = await tx.ticket.updateMany({ where: { id: quote.ticketId, status: "ACCEPTED" }, data: { status: "PAID" } });
      if (moved.count !== 1) throw new Error("QUOTE_NOT_PAYABLE");
      const payment = await tx.transaction.create({ data: { ticketId: quote.ticketId, quoteId: quote.id, userId: quote.ticket.createdById, amount: quote.amount, currency: quote.currency, provider: "MANUAL", status: "PAID" } });
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "payment.confirmed", entityType: "Transaction", entityId: payment.id, meta: { ticketId: quote.ticketId, quoteId } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[admin] fallo al confirmar pago", { quoteId, message });
    return { ok: false, error: message === "ALREADY_PAID" ? "El pago ya estaba confirmado." : "La cotizacion ya no esta disponible para cobrar." };
  }
  revalidatePath("/admin/payments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/dev/projects");
  return { ok: true, error: null };
}
