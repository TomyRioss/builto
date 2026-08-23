import type { TicketStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const ASSIGNED_DEVELOPER_STATUSES: TicketStatus[] = ["PAID", "IN_PROGRESS", "REVIEW", "DONE"];

export async function getDeveloperTickets(developerId: string) {
  try {
    return await prisma.ticket.findMany({
      where: {
        assignedDevId: developerId,
        status: { in: ASSIGNED_DEVELOPER_STATUSES },
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        assignedDevId: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("[dev-tickets] fallo consultando Supabase", {
      message: error instanceof Error ? error.message : "Error desconocido",
    });
    throw new Error("No se pudieron cargar los tickets asignados");
  }
}

export type DeveloperTicket = Awaited<ReturnType<typeof getDeveloperTickets>>[number];

/** Actividad sobre tickets que el developer tiene o tuvo asignados, mas sus propias acciones. */
export async function getDeveloperHistory(developerId: string) {
  const ticketIds = await prisma.ticket.findMany({
    where: { assignedDevId: developerId },
    select: { id: true },
  });
  return prisma.auditLog.findMany({
    where: {
      OR: [
        { actorId: developerId },
        { entityType: "Ticket", entityId: { in: ticketIds.map((t) => t.id) } },
      ],
    },
    select: { id: true, action: true, entityType: true, entityId: true, createdAt: true, actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
