import type { Prisma } from "@/app/generated/prisma/client";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const activeAssignedStatuses: TicketStatus[] = ["PAID", "IN_PROGRESS"];

export async function getDevDashboard(userId: string) {
  const availableWhere = {
    assignedDevId: null,
    status: "PAID" as const,
  } satisfies Prisma.TicketWhereInput;

  try {
    const [availableProjects, assignedActive, assignedReview, completed, recentAssigned, recentAvailable] = await prisma.$transaction([
      prisma.project.count({ where: { tickets: { some: availableWhere } } }),
      prisma.ticket.count({ where: { assignedDevId: userId, status: { in: activeAssignedStatuses } } }),
      prisma.ticket.count({ where: { assignedDevId: userId, status: "REVIEW" } }),
      prisma.ticket.count({ where: { assignedDevId: userId, status: "DONE" } }),
      prisma.ticket.findMany({
        where: { assignedDevId: userId, status: { in: ["PAID", "IN_PROGRESS", "REVIEW", "DONE"] } },
        select: { id: true, title: true, status: true, updatedAt: true, project: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.project.findMany({
        where: { tickets: { some: availableWhere } },
        select: { id: true, name: true, updatedAt: true, _count: { select: { tickets: { where: availableWhere } } } },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
    ]);

    return { availableProjects, assignedActive, assignedReview, completed, recentAssigned, recentAvailable };
  } catch (error) {
    console.error("[dev-dashboard] fallo consultando Supabase", { message: error instanceof Error ? error.message : "Error desconocido" });
    throw new Error("No se pudo cargar el dashboard Developer");
  }
}

export type DevDashboardData = Awaited<ReturnType<typeof getDevDashboard>>;
