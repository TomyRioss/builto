import { prisma } from "@/lib/prisma";

export async function getProjects(ownerId?: string) {
  try {
    return await prisma.project.findMany({
      where: ownerId ? { ownerId } : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            files: true,
            versions: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  } catch (error) {
    console.error("Failed to load projects from Supabase", {
      message: error instanceof Error ? error.message : "Unknown database error",
    });
    throw new Error("Unable to load projects");
  }
}
