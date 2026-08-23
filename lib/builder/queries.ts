import { prisma } from "@/lib/prisma";

/**
 * Conversaciones de Co-Build del usuario, mas nuevas primero.
 * Solo las suyas: el filtro por `ownerId` es lo que impide leer chats ajenos.
 */
export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { kind: "AI", project: { ownerId: userId } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      project: { select: { id: true, name: true } },
    },
  });
}

/** Conversacion completa con mensajes y archivos. `null` si no es del usuario. */
export async function getConversation(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: { id: conversationId, kind: "AI", project: { ownerId: userId } },
    select: {
      id: true,
      purpose: true,
      project: {
        select: {
          id: true,
          name: true,
          files: { select: { path: true, content: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, senderKind: true, body: true, meta: true, createdAt: true },
      },
    },
  });
}

export function filesToRecord(
  files: { path: string; content: string }[],
): Record<string, string> {
  return Object.fromEntries(files.map((f) => [f.path, f.content]));
}

/**
 * Proyectos del usuario para el dashboard, mas recientes primero.
 * Devuelve el id de la conversacion de IA para linkear directo al chat.
 */
export async function listRecentProjects(userId: string, take = 4) {
  const projects = await prisma.project.findMany({
    // Sin conversacion de IA no es un proyecto que el usuario haya construido:
    // son filas sembradas a mano en la DB y no van al dashboard.
    where: {
      ownerId: userId,
      status: { not: "ARCHIVED" },
      conversations: { some: { kind: "AI" } },
    },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      status: true,
      thumbnail: true,
      updatedAt: true,
      conversations: {
        where: { kind: "AI" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  return projects.map(({ conversations, ...project }) => ({
    ...project,
    conversationId: conversations[0]?.id ?? null,
  }));
}

export type RecentProject = Awaited<ReturnType<typeof listRecentProjects>>[number];
