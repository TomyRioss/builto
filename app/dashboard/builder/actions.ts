"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePath } from "@/lib/builder/protocol";
import { getTemplateSeed } from "@/lib/builder/template-seeds";

export type ActionState = { ok: boolean; error: string | null };

/** Crea proyecto + conversacion de IA y manda al chat nuevo. */
export async function createConversation(): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  let conversationId: string;

  try {
    const conversation = await prisma.conversation.create({
      data: {
        kind: "AI",
        project: {
          create: {
            ownerId: session.user.id,
            name: "Sitio nuevo",
            slug: `sitio-${randomUUID().slice(0, 8)}`,
          },
        },
        participants: { create: { userId: session.user.id } },
      },
      select: { id: true },
    });

    conversationId = conversation.id;
  } catch (error) {
    console.error("[builder] no se pudo crear la conversacion", {
      userId: session.user.id,
      error,
    });
    return { ok: false, error: "No pudimos crear el proyecto. Proba de nuevo." };
  }

  revalidatePath("/dashboard/builder");
  redirect(`/dashboard/builder/${conversationId}`);
}

/**
 * Crea proyecto + conversacion sembrados con el codigo de una plantilla.
 *
 * Los archivos de la plantilla se guardan como ProjectFile y pisan al starter
 * via withStarterFiles(): el chat arranca con la plantilla renderizada en el
 * preview, lista para editar por IA o desde el editor.
 */
export async function createConversationFromTemplate(
  slug: string,
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const template = getTemplateSeed(slug);

  if (!template) return { ok: false, error: "Esa plantilla no existe." };

  let conversationId: string;

  try {
    const conversation = await prisma.conversation.create({
      data: {
        kind: "AI",
        project: {
          create: {
            ownerId: session.user.id,
            name: template.name,
            slug: `sitio-${randomUUID().slice(0, 8)}`,
            files: {
              create: Object.entries(template.files).map(([path, content]) => ({
                path,
                content,
              })),
            },
          },
        },
        participants: { create: { userId: session.user.id } },
      },
      select: { id: true },
    });

    conversationId = conversation.id;
  } catch (error) {
    console.error("[builder] no se pudo crear la conversacion desde plantilla", {
      userId: session.user.id,
      slug,
      error,
    });
    return { ok: false, error: "No pudimos crear el proyecto. Proba de nuevo." };
  }

  revalidatePath("/dashboard/builder");
  redirect(`/dashboard/builder/${conversationId}`);
}

/** Borra el proyecto del chat: cascada limpia conversacion, archivos y versiones. */
export async function deleteConversation(projectId: string): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
      select: {
        id: true,
        // Sin este chequeo se borrarian tickets abiertos junto con el proyecto.
        tickets: {
          where: { status: { notIn: ["DONE", "REJECTED", "CANCELLED"] } },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!project) return { ok: false, error: "Ese chat no es tuyo." };
    if (project.tickets.length > 0) {
      return {
        ok: false,
        error: "Este proyecto tiene tickets abiertos. Cerralos antes de borrar el chat.",
      };
    }

    await prisma.project.delete({ where: { id: project.id } });
  } catch (error) {
    console.error("[builder] no se pudo borrar el chat", {
      userId: session.user.id,
      projectId,
      error,
    });
    return { ok: false, error: "No pudimos borrar el chat." };
  }

  revalidatePath("/dashboard/builder");
  return { ok: true, error: null };
}

const saveFileSchema = z.object({
  projectId: z.string().min(1),
  path: z.string().trim().min(1).max(200),
  content: z.string().max(200_000, "El archivo es demasiado grande."),
});

const importFilesSchema = z.object({
  projectId: z.string().min(1),
  files: z.array(z.object({
    path: z.string().trim().min(1).max(200),
    content: z.string().max(200_000, "Uno de los archivos es demasiado grande."),
  })).min(1, "El ZIP no contiene archivos importables.").max(200, "El proyecto supera los 200 archivos."),
});

/** Reemplaza el snapshot editable con el ZIP importado por un usuario autorizado. */
export async function importProjectFiles(input: {
  projectId: string;
  files: { path: string; content: string }[];
}): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = importFilesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const files = parsed.data.files.map((file) => ({
    path: normalizePath(file.path),
    content: file.content,
  }));
  const paths = new Set(files.map((file) => file.path));
  if (paths.size !== files.length) return { ok: false, error: "El ZIP contiene rutas duplicadas." };

  const totalSize = files.reduce((total, file) => total + file.content.length, 0);
  if (totalSize > 4_000_000) return { ok: false, error: "El proyecto supera el limite de 4 MB." };

  try {
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          id: parsed.data.projectId,
          OR: [
            { ownerId: session.user.id },
            { tickets: { some: { assignedDevId: session.user.id, status: "IN_PROGRESS" } } },
          ],
        },
        select: { id: true },
      });
      if (!project) throw new Error("IMPORT_FORBIDDEN");

      await tx.projectFile.deleteMany({ where: { projectId: project.id } });
      await tx.projectFile.createMany({
        data: files.map((file) => ({ projectId: project.id, ...file })),
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[builder] no se pudo importar el proyecto", {
      projectId: parsed.data.projectId,
      userId: session.user.id,
      message,
    });
    return {
      ok: false,
      error: message === "IMPORT_FORBIDDEN"
        ? "No tenes acceso de escritura a este proyecto."
        : "No pudimos importar el proyecto.",
    };
  }

  revalidatePath("/dashboard/builder");
  revalidatePath("/dev/projects");
  return { ok: true, error: null };
}

/** Guarda una edicion manual del usuario en el editor de codigo. */
export async function saveProjectFile(input: {
  projectId: string;
  path: string;
  content: string;
}): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = saveFileSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { projectId, content } = parsed.data;
  const path = normalizePath(parsed.data.path);

  try {
    // Sin este chequeo cualquiera escribe archivos en proyectos ajenos
    // mandando otro projectId.
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { tickets: { some: { assignedDevId: session.user.id, status: "IN_PROGRESS" } } },
        ],
      },
      select: { id: true },
    });

    if (!project) return { ok: false, error: "No tenes acceso de escritura a este proyecto." };

    await prisma.projectFile.upsert({
      where: { projectId_path: { projectId, path } },
      create: { projectId, path, content },
      update: { content },
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error("[builder] no se pudo guardar el archivo", {
      projectId,
      path,
      error,
    });
    return { ok: false, error: "No pudimos guardar el archivo." };
  }
}

const renameSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(1, "El nombre no puede quedar vacio.").max(120),
});

export async function renameProject(input: {
  projectId: string;
  name: string;
}): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = renameSchema.safeParse(input);

  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const updated = await prisma.project.updateMany({
      where: { id: parsed.data.projectId, ownerId: session.user.id },
      // Marca el nombre como elegido por el usuario: el retitulado automatico
      // de la IA filtra por este flag y deja de pisarlo.
      data: { name: parsed.data.name, nameSetByUser: true },
    });

    if (updated.count === 0) return { ok: false, error: "Ese proyecto no es tuyo." };

    revalidatePath("/dashboard/builder");
    return { ok: true, error: null };
  } catch (error) {
    console.error("[builder] no se pudo renombrar el proyecto", {
      projectId: parsed.data.projectId,
      error,
    });
    return { ok: false, error: "No pudimos renombrar el proyecto." };
  }
}

/** Techo del thumbnail. Arriba de esto no entra comodo en una fila de Postgres. */
const MAX_THUMBNAIL_BYTES = 400_000;

const thumbnailSchema = z.object({
  projectId: z.string().min(1),
  // El dataURL lo produce el sandbox, que corre codigo generado por la IA:
  // se valida formato y tamaño antes de guardarlo.
  dataUrl: z
    .string()
    .max(MAX_THUMBNAIL_BYTES, "La captura es demasiado grande.")
    .regex(/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/, "Captura invalida."),
});

/** Guarda la captura del preview que manda el sandbox. */
export async function saveProjectThumbnail(input: {
  projectId: string;
  dataUrl: string;
}): Promise<ActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = thumbnailSchema.safeParse(input);

  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const allowed = await prisma.project.findFirst({
      where: {
        id: parsed.data.projectId,
        OR: [
          { ownerId: session.user.id },
          { tickets: { some: { assignedDevId: session.user.id, status: "IN_PROGRESS" } } },
        ],
      },
      select: { id: true },
    });
    if (!allowed) return { ok: false, error: "No tenes acceso de escritura a este proyecto." };

    const updated = await prisma.project.updateMany({
      where: { id: parsed.data.projectId },
      data: { thumbnail: parsed.data.dataUrl },
    });

    if (updated.count === 0) return { ok: false, error: "Ese proyecto no es tuyo." };

    revalidatePath("/dashboard");
    return { ok: true, error: null };
  } catch (error) {
    console.error("[builder] no se pudo guardar la captura del preview", {
      projectId: parsed.data.projectId,
      error,
    });
    return { ok: false, error: "No pudimos guardar la captura del preview." };
  }
}
