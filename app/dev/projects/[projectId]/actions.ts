"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type DeveloperTicketActionState = { ok: boolean; error: string | null };

async function requireDeveloper() {
  const session = await auth();
  return session?.user.role === "DEV" ? session.user : null;
}

function refreshDeveloperViews(projectId: string, ticketId: string) {
  revalidatePath(`/dev/projects/${projectId}`);
  revalidatePath(`/dev/projects/${projectId}/tickets/${ticketId}`);
  revalidatePath("/dev/projects");
  revalidatePath("/dev/dashboard");
}

export async function takeTicket(projectId: string, ticketId: string): Promise<DeveloperTicketActionState> {
  const developer = await requireDeveloper();
  if (!developer) return { ok: false, error: "Necesitas una sesion Developer activa." };

  try {
    const assigned = await prisma.$transaction(async (tx) => {
      const result = await tx.ticket.updateMany({
        where: { id: ticketId, projectId, assignedDevId: null, status: "PAID" },
        data: { assignedDevId: developer.id },
      });
      if (result.count === 0) return false;

      await tx.auditLog.create({
        data: { actorId: developer.id, action: "ticket.assigned", entityType: "Ticket", entityId: ticketId, meta: { projectId } },
      });
      return true;
    });

    if (!assigned) return { ok: false, error: "El ticket ya no esta disponible o todavia no fue pagado." };
  } catch (error) {
    console.error("[dev-ticket] fallo al tomar ticket", { developerId: developer.id, projectId, ticketId, error });
    return { ok: false, error: "No pudimos asignarte el ticket. Intenta nuevamente." };
  }

  refreshDeveloperViews(projectId, ticketId);
  return { ok: true, error: null };
}

export async function startTicketWork(projectId: string, ticketId: string): Promise<DeveloperTicketActionState> {
  return transitionAssignedTicket(projectId, ticketId, "PAID", "IN_PROGRESS", "ticket.started");
}

export async function sendTicketToReview(projectId: string, ticketId: string): Promise<DeveloperTicketActionState> {
  return transitionAssignedTicket(projectId, ticketId, "IN_PROGRESS", "REVIEW", "ticket.sent_to_review");
}

async function transitionAssignedTicket(projectId: string, ticketId: string, from: "PAID" | "IN_PROGRESS", to: "IN_PROGRESS" | "REVIEW", auditAction: string): Promise<DeveloperTicketActionState> {
  const developer = await requireDeveloper();
  if (!developer) return { ok: false, error: "Necesitas una sesion Developer activa." };

  try {
    const changed = await prisma.$transaction(async (tx) => {
      const result = await tx.ticket.updateMany({
        where: { id: ticketId, projectId, assignedDevId: developer.id, status: from },
        data: { status: to },
      });
      if (result.count === 0) return false;

      await tx.auditLog.create({
        data: { actorId: developer.id, action: auditAction, entityType: "Ticket", entityId: ticketId, meta: { projectId, from, to } },
      });
      return true;
    });

    if (!changed) return { ok: false, error: "El ticket cambio de estado o no esta asignado a tu cuenta." };
  } catch (error) {
    console.error("[dev-ticket] fallo al cambiar estado", { developerId: developer.id, projectId, ticketId, from, to, error });
    return { ok: false, error: "No pudimos actualizar el ticket. Intenta nuevamente." };
  }

  refreshDeveloperViews(projectId, ticketId);
  return { ok: true, error: null };
}
