import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Bucket publico para assets que el builder mete en los sitios generados.
 * Publico a proposito: la URL tiene que seguir sirviendo la imagen cuando el
 * sandbox la renderiza, sin firmas que venzan.
 */
export const BUCKET = "builder-assets";

/** Mismos limites que los adjuntos de tickets: el cliente ya comprime a webp. */
export const MAX_FILES = 4;
const MAX_BYTES = 1_500_000;
const ALLOWED_MIME = ["image/webp", "image/png", "image/jpeg", "image/gif"];

let client: ReturnType<typeof createClient> | null = null;
let bucketReady = false;

/**
 * Cliente con service role: solo server. La app decide quien sube (sesion);
 * leer es publico por diseno del bucket.
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

/** Crea el bucket publico si todavia no existe. Idempotente por proceso. */
async function ensureBucket() {
  if (bucketReady) return;

  const { error } = await storage().storage.createBucket(BUCKET, { public: true });

  // "Bucket already exists" llega como error: si no es ese, si importa.
  if (error && !error.message.toLowerCase().includes("exists")) {
    throw new Error(`No pudimos preparar el bucket ${BUCKET}: ${error.message}`);
  }

  bucketReady = true;
}

type ParsedDataUrl = { mime: string; bytes: Buffer };

function parseDataUrl(dataUrl: string): ParsedDataUrl | null {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);

  if (!match) return null;

  return { mime: match[1].toLowerCase(), bytes: Buffer.from(match[2], "base64") };
}

export type BuilderImage = { url: string };

/**
 * Sube las imagenes del turno (data URLs base64) al bucket publico y devuelve
 * las URLs estables para que el modelo las referencie en el codigo generado.
 */
export async function uploadBuilderImages(
  conversationId: string,
  userId: string,
  dataUrls: string[],
): Promise<BuilderImage[]> {
  if (dataUrls.length === 0) return [];
  if (dataUrls.length > MAX_FILES) {
    throw new Error(`Maximo ${MAX_FILES} imagenes por mensaje.`);
  }

  await ensureBucket();

  const uploaded: BuilderImage[] = [];

  for (const [i, dataUrl] of dataUrls.entries()) {
    const parsed = parseDataUrl(dataUrl);

    if (!parsed || !ALLOWED_MIME.includes(parsed.mime)) {
      throw new Error("Formato de imagen no soportado.");
    }
    if (parsed.bytes.length > MAX_BYTES) {
      throw new Error("Cada imagen tiene que pesar menos de 1.5 MB.");
    }

    const ext =
      parsed.mime === "image/png"
        ? "png"
        : parsed.mime === "image/jpeg"
          ? "jpg"
          : parsed.mime === "image/gif"
            ? "gif"
            : "webp";
    const key = `${conversationId}/${userId}/${Date.now()}-${i}.${ext}`;

    const { error } = await storage()
      .storage.from(BUCKET)
      .upload(key, parsed.bytes, { contentType: parsed.mime, upsert: false });

    if (error) {
      throw new Error(`No pudimos subir la imagen ${i + 1}: ${error.message}`);
    }

    const { data } = storage().storage.from(BUCKET).getPublicUrl(key);
    uploaded.push({ url: data.publicUrl });
  }

  return uploaded;
}
