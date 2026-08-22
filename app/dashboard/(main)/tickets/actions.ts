"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@/app/generated/prisma/enums";

export type ActionState = { ok: boolean; error: string | null };

/** Estados en los que el cliente todavia puede dar de baja el ticket. */
const CANCELABLE: TicketStatus[] = ["PENDING", "CLARIFYING", "QUOTED"];

const openSchema = z.object({
  projectId: z.string().min(1, "Elegi un proyecto."),
  title: z
    .string()
    .trim()
    .min(4, "El titulo necesita al menos 4 caracteres.")
    .max(120, "El titulo no puede pasar los 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "Contanos un poco mas: minimo 10 caracteres.")
    .max(5000, "La descripcion no puede pasar los 5000 caracteres."),
});

export async function openTicket(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = openSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { projectId, title, description } = parsed.data;

  try {
    // El proyecto tiene que ser del usuario: sin esto cualquiera abre tickets
    // en proyectos ajenos mandando otro projectId.
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
      select: { id: true },
    });

    if (!project) {
      return { ok: false, error: "Ese proyecto no es tuyo." };
    }

    await prisma.ticket.create({
      data: {
        projectId,
        createdById: session.user.id,
        title,
        description,
      },
    });
  } catch (error) {
    console.error("[tickets] fallo al abrir ticket", {
      userId: session.user.id,
      projectId,
      title,
      error,
    });
    return { ok: false, error: "No pudimos abrir el ticket. Proba de nuevo." };
  }

  revalidatePath("/dashboard/tickets");
  return { ok: true, error: null };
}

export async function cancelTicket(ticketId: string): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  try {
    const { count } = await prisma.ticket.updateMany({
      where: {
        id: ticketId,
        createdById: session.user.id,
        status: { in: CANCELABLE },
      },
      data: { status: "CANCELLED" },
    });

    if (count === 0) {
      return { ok: false, error: "Este ticket ya no se puede cancelar." };
    }
  } catch (error) {
    console.error("[tickets] fallo al cancelar ticket", {
      userId: session.user.id,
      ticketId,
      error,
    });
    return { ok: false, error: "No pudimos cancelar el ticket." };
  }

  revalidatePath("/dashboard/tickets");
  return { ok: true, error: null };
}

/** Respuesta del cliente a la cotizacion vigente (la ultima SENT). */
export async function respondQuote(
  ticketId: string,
  accept: boolean,
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) return { ok: false, error: "Inicia sesion de nuevo." };

  try {
    const quote = await prisma.quote.findFirst({
      where: {
        ticketId,
        status: "SENT",
        ticket: { createdById: session.user.id, status: "QUOTED" },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, expiresAt: true },
    });

    if (!quote) {
      return { ok: false, error: "No hay una cotizacion vigente para responder." };
    }

    if (quote.expiresAt && quote.expiresAt < new Date()) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: "EXPIRED" },
      });
      return { ok: false, error: "La cotizacion vencio. Pedi una nueva." };
    }

    // Cotizacion y ticket se mueven juntos o no se mueve ninguno.
    await prisma.$transaction([
      prisma.quote.update({
        where: { id: quote.id },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
      }),
    ]);
  } catch (error) {
    console.error("[tickets] fallo al responder la cotizacion", {
      userId: session.user.id,
      ticketId,
      accept,
      error,
    });
    return { ok: false, error: "No pudimos registrar tu respuesta." };
  }

  revalidatePath("/dashboard/tickets");
  return { ok: true, error: null };
}
