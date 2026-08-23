import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildSystemPrompt, streamCompletion, type ChatMessage } from "@/lib/builder/deepseek";
import { parseReply } from "@/lib/builder/protocol";
import { filesToRecord, getConversation } from "@/lib/builder/queries";
import { generateTitle, shouldRename } from "@/lib/builder/title";
import { refinePurpose, shouldRefinePurpose } from "@/lib/builder/purpose";
import { withStarterFiles } from "@/lib/builder/template";

/** Cuantos mensajes de historial se mandan al modelo por turno. */
const HISTORY_LIMIT = 20;

// Sin esto Vercel corta la funcion a los 10-15s por defecto y un turno largo
// de DeepSeek (varios archivos completos) queda a mitad de stream.
export const maxDuration = 300;

const bodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escribi algo antes de enviar.")
    .max(5000, "El mensaje no puede pasar los 5000 caracteres."),
  // Data URLs (base64). Limite bajo: son mensajes de chat, no un uploader.
  images: z
    .array(z.string().startsWith("data:image/"))
    .max(4, "Maximo 4 imagenes por mensaje.")
    .optional(),
});

/**
 * Manda el turno del usuario a DeepSeek y devuelve la respuesta en streaming,
 * tal cual sale del modelo (prosa + bloques `<file>`). El cliente parsea el
 * mismo texto para pintar el preview mientras se escribe; aca, al cerrar el
 * stream, se persiste el mensaje y los archivos.
 */
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/builder/[conversationId]">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Inicia sesion de nuevo." }, { status: 401 });
  }

  const { conversationId } = await ctx.params;

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch (error) {
    console.error("[builder] body ilegible", { conversationId, error });
    return NextResponse.json({ error: "Pedido invalido." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const userMessage = parsed.data.content;
  const images = parsed.data.images ?? [];

  const conversation = await getConversation(conversationId, session.user.id);

  if (!conversation) {
    return NextResponse.json({ error: "Esa conversacion no existe." }, { status: 404 });
  }

  const projectId = conversation.project!.id;
  const files = withStarterFiles(filesToRecord(conversation.project!.files));

  const history: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(files, conversation.purpose) },
    ...conversation.messages
      .filter((m) => m.senderKind === "USER" || m.senderKind === "AI")
      .slice(-HISTORY_LIMIT)
      .map((m): ChatMessage => ({
        role: m.senderKind === "USER" ? "user" : "assistant",
        content: m.body,
      })),
    {
      role: "user",
      content:
        images.length === 0
          ? userMessage
          : [
              { type: "text", text: userMessage },
              ...images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
            ],
    },
  ];

  try {
    await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        senderKind: "USER",
        body: userMessage,
        meta: images.length > 0 ? { images } : undefined,
      },
    });
  } catch (error) {
    console.error("[builder] no se pudo guardar el mensaje del usuario", {
      conversationId,
      error,
    });
    return NextResponse.json({ error: "No pudimos guardar tu mensaje." }, { status: 500 });
  }

  let deltas: AsyncGenerator<string>;
  try {
    deltas = await streamCompletion(history, request.signal);
  } catch (error) {
    console.error("[builder] DeepSeek rechazo el pedido", { conversationId, error });
    return NextResponse.json(
      { error: "La IA no respondio. Proba de nuevo en un momento." },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let raw = "";
      const startedAt = performance.now();
      let firstDeltaAt: number | null = null;

      try {
        for await (const delta of deltas) {
          firstDeltaAt ??= performance.now();
          raw += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (error) {
        console.error("[builder] se corto el stream de DeepSeek", {
          conversationId,
          recibido: raw.length,
          error,
        });
        controller.error(error);
        return;
      }

      // Aunque el stream muera, lo ya recibido se guarda: perder el turno
      // entero por un corte al final seria peor.
      try {
        const streamFinishedAt = performance.now();
        await persist({ conversationId, projectId, raw, userMessage });
        console.info("[builder] turno completo", {
          conversationId,
          firstTokenMs:
            firstDeltaAt === null ? null : Math.round(firstDeltaAt - startedAt),
          generationMs:
            firstDeltaAt === null ? null : Math.round(streamFinishedAt - firstDeltaAt),
          totalMs: Math.round(performance.now() - startedAt),
          receivedChars: raw.length,
        });
      } catch (error) {
        console.error("[builder] no se pudo persistir la respuesta", {
          conversationId,
          projectId,
          error,
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Evita que un proxy junte chunks y mate el preview en vivo.
      "X-Accel-Buffering": "no",
    },
  });
}

async function persist({
  conversationId,
  projectId,
  raw,
  userMessage,
}: {
  conversationId: string;
  projectId: string;
  raw: string;
  userMessage: string;
}) {
  const { prose, files } = parseReply(raw);
  const paths = Object.keys(files);

  await prisma.$transaction([
    ...paths.map((path) =>
      prisma.projectFile.upsert({
        where: { projectId_path: { projectId, path } },
        create: { projectId, path, content: files[path] },
        update: { content: files[path] },
      }),
    ),
    prisma.message.create({
      data: {
        conversationId,
        senderKind: "AI",
        body: prose || "Actualice los archivos del proyecto.",
        meta: { files: paths },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  // Titula el proyecto con el primer pedido, solo mientras tenga el nombre
  // por defecto (no pisa un rename manual posterior). Le pide a la IA un
  // titulo real en vez de truncar el pedido tal cual lo escribio el usuario.
  const initialTitle =
    (await generateTitle([{ role: "user", content: userMessage }])) ??
    deriveProjectName(userMessage);

  await prisma.project.updateMany({
    where: { id: projectId, name: "Sitio nuevo" },
    data: { name: initialTitle },
  });

  await maybeRetitle({ conversationId, projectId });
  await maybeRefinePurpose({ conversationId });
}

/**
 * Cada ~5 mensajes le pide a la IA que actualice el proposito del chat.
 * Mismo criterio que maybeRetitle: accesorio, nunca rompe el turno del
 * usuario si falla.
 */
async function maybeRefinePurpose({ conversationId }: { conversationId: string }) {
  try {
    const total = await prisma.message.count({ where: { conversationId } });

    if (!shouldRefinePurpose(total)) return;

    const [conversation, recent] = await Promise.all([
      prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { purpose: true },
      }),
      prisma.message.findMany({
        where: { conversationId, senderKind: { in: ["USER", "AI"] } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { senderKind: true, body: true },
      }),
    ]);

    const purpose = await refinePurpose(
      conversation?.purpose ?? null,
      recent.reverse().map((m): ChatMessage => ({
        role: m.senderKind === "USER" ? "user" : "assistant",
        content: m.body,
      })),
    );

    if (!purpose) return;

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { purpose },
    });
  } catch (error) {
    console.error("[builder] no se pudo refinar el proposito del chat", {
      conversationId,
      error,
    });
  }
}

/**
 * Cada ~5 mensajes le pide a la IA un titulo real para el proyecto, en vez del
 * primer mensaje del usuario recortado.
 *
 * Corre antes de cerrar el stream para que el router.refresh() del cliente ya
 * traiga el nombre nuevo. Si falla, el nombre se queda como estaba: renombrar
 * es accesorio y no justifica romperle el turno al usuario, por eso no hay
 * feedback de UI.
 */
async function maybeRetitle({
  conversationId,
  projectId,
}: {
  conversationId: string;
  projectId: string;
}) {
  try {
    const total = await prisma.message.count({ where: { conversationId } });

    if (!shouldRename(total)) return;

    const recent = await prisma.message.findMany({
      where: { conversationId, senderKind: { in: ["USER", "AI"] } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { senderKind: true, body: true },
    });

    const title = await generateTitle(
      recent.reverse().map((m): ChatMessage => ({
        role: m.senderKind === "USER" ? "user" : "assistant",
        content: m.body,
      })),
    );

    if (!title) return;

    // El filtro por nameSetByUser es lo que protege un rename manual.
    await prisma.project.updateMany({
      where: { id: projectId, nameSetByUser: false },
      data: { name: title },
    });
  } catch (error) {
    console.error("[builder] no se pudo retitular el proyecto", {
      conversationId,
      projectId,
      error,
    });
  }
}

function deriveProjectName(message: string): string {
  const oneLine = message.trim().replace(/\s+/g, " ");
  return oneLine.length > 60 ? `${oneLine.slice(0, 57)}...` : oneLine;
}
