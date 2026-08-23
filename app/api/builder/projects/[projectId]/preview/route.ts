import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isStaff } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { buildProjectPreview } from "@/lib/builder/sandbox-build";
import { filesToRecord } from "@/lib/builder/queries";
import { withStarterFiles } from "@/lib/builder/template";

// El primer build en frio instala node_modules del sandbox base (~30-60s).
export const maxDuration = 120;

/**
 * Compila el proyecto con Vite real en el server y devuelve el HTML listo
 * para meter en un iframe. El cliente pide esto (no usa Sandpack): cache-bust
 * con `?v=` cada vez que quiere una recompilacion.
 *
 * Por projectId (no conversationId): tanto el chat del cliente como las
 * pantallas de revision de dev/admin necesitan el mismo preview y no todas
 * tienen una conversacion a mano.
 */
export async function GET(
  request: Request,
  ctx: RouteContext<"/api/builder/projects/[projectId]/preview">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { projectId } = await ctx.params;

  const project = isStaff(session.user.role)
    ? await prisma.project.findFirst({
        where: { id: projectId },
        select: { id: true, files: { select: { path: true, content: true } } },
      })
    : await prisma.project.findFirst({
        where: { id: projectId, ownerId: session.user.id },
        select: { id: true, files: { select: { path: true, content: true } } },
      });

  if (!project) {
    return new NextResponse("Proyecto no encontrado", { status: 404 });
  }

  const files = withStarterFiles(filesToRecord(project.files));
  const result = await buildProjectPreview(project.id, files);

  if (!result.ok) {
    return new NextResponse(errorPage(result.error), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(result.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function errorPage(message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Error de build</title>
    <style>
      body { margin: 0; padding: 24px; font-family: Inter, Helvetica, "Open Sans", Roboto, Verdana, Georgia, sans-serif; background: #f8f9fa; color: #191c1d; }
      h1 { font-size: 14px; font-weight: 600; color: #b42318; text-transform: uppercase; letter-spacing: 0.05em; }
      pre { margin-top: 12px; padding: 16px; background: #0d1117; color: #c9d1d9; border-radius: 8px; font-size: 12px; line-height: 1.6; overflow: auto; white-space: pre-wrap; word-break: break-word; }
    </style>
  </head>
  <body>
    <h1>No se pudo compilar el sitio</h1>
    <pre>${escaped}</pre>
  </body>
</html>`;
}
