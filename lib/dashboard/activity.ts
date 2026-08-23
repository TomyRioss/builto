import { prisma } from "@/lib/prisma";

export type ActivityItem = {
  id: string;
  text: string;
  at: Date;
  kind: "ai" | "ticket";
};

/** Que se muestra segun el estado del ticket. Los que no estan aca no generan actividad. */
const TICKET_TEXT: Partial<Record<string, (title: string) => string>> = {
  PENDING: (t) => `Abriste el ticket "${t}"`,
  CLARIFYING: (t) => `Te pidieron mas detalles del ticket "${t}"`,
  QUOTED: (t) => `Cotizaron tu ticket "${t}"`,
  ACCEPTED: (t) => `Aceptaste la cotizacion de "${t}"`,
  PAID: (t) => `Pagaste el ticket "${t}"`,
  IN_PROGRESS: (t) => `Un dev esta trabajando en "${t}"`,
  REVIEW: (t) => `"${t}" esta esperando tu aprobacion`,
  DONE: (t) => `Se completo el ticket "${t}"`,
  REJECTED: (t) => `Rechazaron el ticket "${t}"`,
  CANCELLED: (t) => `Cancelaste el ticket "${t}"`,
};

/**
 * Actividad del usuario, mas reciente primero.
 *
 * No hay tabla de feed: se arma con lo que ya se escribe hoy — los mensajes de
 * la IA y el estado de los tickets. `ProjectVersion` y `AuditLog` existen en el
 * schema pero todavia nadie los escribe, asi que no aportan nada.
 */
export async function listActivity(userId: string, take = 12): Promise<ActivityItem[]> {
  const [aiMessages, tickets] = await Promise.all([
    prisma.message.findMany({
      where: { senderKind: "AI", conversation: { project: { ownerId: userId } } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        createdAt: true,
        conversation: { select: { project: { select: { name: true } } } },
      },
    }),
    prisma.ticket.findMany({
      where: { createdById: userId },
      orderBy: { updatedAt: "desc" },
      take,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);

  const items: ActivityItem[] = [
    ...aiMessages.map((message) => ({
      id: `msg-${message.id}`,
      text: `La IA actualizo ${message.conversation.project?.name ?? "tu sitio"}`,
      at: message.createdAt,
      kind: "ai" as const,
    })),
    ...tickets.flatMap((ticket) => {
      const text = TICKET_TEXT[ticket.status]?.(ticket.title);

      return text
        ? [{ id: `ticket-${ticket.id}`, text, at: ticket.updatedAt, kind: "ticket" as const }]
        : [];
    }),
  ];

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, take);
}
