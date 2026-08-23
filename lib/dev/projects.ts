import type { Prisma } from "@/app/generated/prisma/client";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const DEVELOPER_VISIBLE_TICKET_STATUSES: TicketStatus[] = ["PAID", "IN_PROGRESS", "REVIEW", "DONE"];
export const OPEN_TICKET_STATUSES: TicketStatus[] = ["PAID", "IN_PROGRESS", "REVIEW"];

const availableTicketWhere = {
  assignedDevId: null,
  status: "PAID" as const,
} satisfies Prisma.TicketWhereInput;

type BriefMetadata = {
  preview: string | null;
  priority: string | null;
  technologies: string[];
};

function asRecord(value: Prisma.JsonValue | null): Record<string, Prisma.JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, Prisma.JsonValue> : {};
}

function firstString(record: Record<string, Prisma.JsonValue>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function stringList(record: Record<string, Prisma.JsonValue>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
    if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function getBriefMetadata(brief: Prisma.JsonValue | null): BriefMetadata {
  const data = asRecord(brief);
  return {
    preview: firstString(data, ["preview", "summary", "description", "descripcion"]),
    priority: firstString(data, ["priority", "prioridad"]),
    technologies: stringList(data, ["technologies", "technology", "stack", "techStack", "tecnologias"]),
  };
}

export async function getAvailableDevProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { tickets: { some: availableTicketWhere } },
      select: {
        id: true,
        name: true,
        brief: true,
        updatedAt: true,
        owner: { select: { name: true } },
        tickets: {
          where: availableTicketWhere,
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, title: true, status: true, assignedDevId: true, updatedAt: true },
        },
        _count: { select: { tickets: { where: availableTicketWhere } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return projects.map((project) => ({
      ...project,
      metadata: getBriefMetadata(project.brief),
    }));
  } catch (error) {
    console.error("[dev-projects] fallo consultando Supabase", {
      message: error instanceof Error ? error.message : "Error desconocido",
    });
    throw new Error("No se pudieron cargar los proyectos disponibles");
  }
}

export type AvailableDevProject = Awaited<ReturnType<typeof getAvailableDevProjects>>[number];

export async function getAllDevProjects() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        brief: true,
        updatedAt: true,
        owner: { select: { name: true } },
        tickets: {
          where: { status: { in: OPEN_TICKET_STATUSES } },
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, title: true, status: true, assignedDevId: true, updatedAt: true },
        },
        _count: { select: { tickets: { where: { status: { in: OPEN_TICKET_STATUSES } } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return projects.map((project) => ({ ...project, metadata: getBriefMetadata(project.brief) }));
  } catch (error) {
    console.error("[dev-projects] fallo consultando todos los proyectos", { message: error instanceof Error ? error.message : "Error desconocido" });
    throw new Error("No se pudieron cargar los proyectos");
  }
}

export type DevProject = Awaited<ReturnType<typeof getAllDevProjects>>[number];

export async function getDevProjectDetail(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        brief: true,
        updatedAt: true,
        owner: { select: { name: true, email: true } },
        tickets: {
          where: { status: { in: DEVELOPER_VISIBLE_TICKET_STATUSES } },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            assignedDevId: true,
            createdAt: true,
            updatedAt: true,
            assignedDev: { select: { name: true, email: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    return project ? { ...project, metadata: getBriefMetadata(project.brief) } : null;
  } catch (error) {
    console.error("[dev-project] fallo consultando el proyecto", { projectId, message: error instanceof Error ? error.message : "Error desconocido" });
    throw new Error("No se pudo cargar el proyecto");
  }
}
