import { prisma } from "@/lib/prisma";

export async function getReviewStage(ticketId: string) {
  const events = await prisma.auditLog.findMany({
    where: {
      entityId: ticketId,
      action: { in: ["ticket.sent_to_review", "ticket.admin_review_approved"] },
    },
    select: { action: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });
  return events[0]?.action === "ticket.admin_review_approved" ? "CLIENT" as const : "ADMIN" as const;
}
