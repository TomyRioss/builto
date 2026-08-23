import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Bucket privado: nada de aca se sirve publico, siempre por URL firmada. */
export const BUCKET = "ticket-attachments";

/** Limites del adjunto. El cliente ya comprime a webp; esto es el ultimo filtro. */
export const MAX_FILES = 4;
export const MAX_BYTES = 1_500_000;
export const ALLOWED_MIME = ["image/webp", "image/png", "image/jpeg"];

let client: ReturnType<typeof createClient> | null = null;

/**
 * Cliente con service role: solo server. Sube y firma URLs sin depender de RLS
 * de Storage — el permiso se decide en la app (dueno del ticket o staff).
 */
function storage() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[storage] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export type UploadInput = {
  ticketId: string;
  uploaderId: string;
  files: File[];
};

export type Uploaded = {
  storageKey: string;
  mimeType: string;
  size: number;
};

/** Valida y sube. Devuelve las filas listas para insertar en TicketAttachment. */
export async function uploadTicketAttachments({
  ticketId,
  uploaderId,
  files,
}: UploadInput): Promise<Uploaded[]> {
  if (files.length > MAX_FILES) {
    throw new Error(`Maximo ${MAX_FILES} imagenes por ticket.`);
  }

  const uploaded: Uploaded[] = [];

  for (const [i, file] of files.entries()) {
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`Formato no soportado: ${file.type || "desconocido"}.`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Cada imagen tiene que pesar menos de 1.5 MB.");
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const storageKey = `${ticketId}/${Date.now()}-${i}.${ext}`;

    const { error } = await storage()
      .storage.from(BUCKET)
      .upload(storageKey, file, { contentType: file.type, upsert: false });

    if (error) {
      // Lo que ya subio queda huerfano en el bucket; se limpia con lifecycle.
      throw new Error(`No pudimos subir "${file.name}": ${error.message}`);
    }

    uploaded.push({ storageKey, mimeType: file.type, size: file.size });
  }

  return uploaded;
}

/** URL firmada por 1 hora para mostrar el adjunto en el detalle del ticket. */
export async function signAttachmentUrls(
  keys: string[],
): Promise<Record<string, string>> {
  if (keys.length === 0) return {};

  const { data, error } = await storage()
    .storage.from(BUCKET)
    .createSignedUrls(keys, 3600);

  if (error) throw new Error(error.message);

  return Object.fromEntries(
    (data ?? []).flatMap((row) =>
      row.signedUrl && row.path ? [[row.path, row.signedUrl] as const] : [],
    ),
  );
}

/** Borra binarios del bucket. Se usa si falla el insert en la base. */
export async function removeTicketAttachments(keys: string[]) {
  if (keys.length === 0) return;

  const { error } = await storage().storage.from(BUCKET).remove(keys);

  if (error) console.error("[storage] no pudimos limpiar adjuntos", { keys, error });
}
