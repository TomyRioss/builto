import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const [pending, quoted, accepted, paidUnassigned, inProgress, review, recent] = await prisma.$transaction([
    prisma.ticket.count({ where: { status: { in: ["PENDING", "CLARIFYING"] } } }),
    prisma.ticket.count({ where: { status: "QUOTED" } }),
    prisma.ticket.count({ where: { status: "ACCEPTED" } }),
    prisma.ticket.count({ where: { status: "PAID", assignedDevId: null } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: "REVIEW" } }),
    prisma.ticket.findMany({
      select: { id: true, title: true, status: true, updatedAt: true, project: { select: { name: true } }, createdBy: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);
  return { pending, quoted, accepted, paidUnassigned, inProgress, review, recent };
}

export async function getAdminTickets() {
  return prisma.ticket.findMany({
    select: {
      id: true, title: true, status: true, createdAt: true, updatedAt: true,
      project: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      assignedDev: { select: { name: true, email: true } },
      quotes: { orderBy: { createdAt: "desc" }, take: 1, select: { amount: true, currency: true, estimatedDays: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminTicket(ticketId: string) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      project: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      assignedDev: { select: { id: true, name: true, email: true } },
      attachments: { orderBy: { createdAt: "asc" } },
      quotes: { orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getAdminConversations() {
  return prisma.conversation.findMany({
    where: { kind: "TICKET", ticketId: { not: null } },
    select: {
      id: true,
      ticketId: true,
      ticket: { select: { id: true, title: true, status: true, createdBy: { select: { name: true, email: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, senderKind: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAssignableDevelopers() {
  return prisma.user.findMany({
    where: { role: "DEV", isActive: true },
    select: { id: true, name: true, email: true, _count: { select: { ticketsAssigned: { where: { status: { in: ["PAID", "IN_PROGRESS", "REVIEW"] } } } } } },
    orderBy: { name: "asc" },
  });
}

export async function getAdminPayments() {
  const [acceptedQuotes, transactions] = await Promise.all([
    prisma.quote.findMany({
      where: { status: "ACCEPTED", ticket: { status: "ACCEPTED" } },
      select: { id: true, amount: true, currency: true, estimatedDays: true, createdAt: true, ticket: { select: { id: true, title: true, project: { select: { name: true } }, createdBy: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      select: { id: true, amount: true, currency: true, provider: true, status: true, createdAt: true, ticket: { select: { id: true, title: true, project: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  return { acceptedQuotes, transactions };
}

export async function getAdminDevelopers() {
  return prisma.user.findMany({
    where: { role: "DEV" },
    select: {
      id: true, name: true, email: true, createdAt: true,
      ticketsAssigned: {
        where: { status: { in: ["PAID", "IN_PROGRESS", "REVIEW", "DONE"] } },
        select: { id: true, title: true, status: true, updatedAt: true, project: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdminAuditLog() {
  return prisma.auditLog.findMany({
    select: { id: true, action: true, entityType: true, entityId: true, meta: true, createdAt: true, actor: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getAdminTeam() {
  const [users, invites] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["DEV", "ADMIN", "OWNER"] } }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, _count: { select: { ticketsAssigned: true } } }, orderBy: [{ role: "desc" }, { name: "asc" }] }),
    prisma.invite.findMany({ where: { acceptedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, email: true, role: true, expiresAt: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return { users, invites };
}
