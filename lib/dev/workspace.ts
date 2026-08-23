import { prisma } from "@/lib/prisma";

/** Workspace editable de un ticket que el developer ya inicio. */
export async function getDeveloperWorkspace(
  projectId: string,
  ticketId: string,
  developerId: string,
) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      projectId,
      assignedDevId: developerId,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      project: {
        select: {
          id: true,
          name: true,
          files: { select: { path: true, content: true } },
        },
      },
    },
  });
}

export type DeveloperWorkspaceData = NonNullable<
  Awaited<ReturnType<typeof getDeveloperWorkspace>>
>;
