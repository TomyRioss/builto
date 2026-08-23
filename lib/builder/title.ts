import { complete, type ChatMessage } from "./deepseek";

/** Cada cuantos mensajes la IA re-titula el proyecto. */
export const RENAME_EVERY = 5;

/** Cuantos mensajes agrega un turno: el del usuario y el de la IA. */
const PER_TURN = 2;

/** Cuantos mensajes del final se le mandan al modelo para titular. */
const CONTEXT_MESSAGES = 6;

/** Techo del titulo. Mas largo que esto no entra en el sidebar. */
const MAX_LENGTH = 40;

/**
 * El contador salta de a 2 (usuario + IA), asi que nunca cae justo en un
 * multiplo de 5: hay que detectar el cruce, no la igualdad. Con RENAME_EVERY=5
 * dispara en los turnos 3, 5, 8, 10... o sea cada ~5 mensajes.
 */
export function shouldRename(totalMessages: number): boolean {
  if (totalMessages < RENAME_EVERY) return false;

  const before = totalMessages - PER_TURN;
  return Math.floor(totalMessages / RENAME_EVERY) > Math.floor(before / RENAME_EVERY);
}

/** Recorta y limpia lo que devuelve el modelo. Vacio si no sirve. */
export function normalizeTitle(raw: string): string {
  const clean = raw
    .trim()
    .replace(/^["'`]+|["'`.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length === 0) return "";

  return clean.length > MAX_LENGTH ? `${clean.slice(0, MAX_LENGTH - 1).trimEnd()}…` : clean;
}

const SYSTEM = `Titulas proyectos web. Te paso una conversacion entre un usuario y una IA que construye su sitio.

Devolve SOLO el titulo, nada mas. Sin comillas, sin punto final, sin prefijos.
En español, maximo ${MAX_LENGTH} caracteres.
Describi el SITIO que se esta construyendo, no la conversacion.

Ejemplos: "Landing para estudio juridico", "Tienda de plantas", "Portfolio de fotografia"`;

/**
 * Pide un titulo corto a DeepSeek. Devuelve `null` ante cualquier problema:
 * renombrar es accesorio y no puede romper el turno del usuario.
 */
export async function generateTitle(messages: ChatMessage[]): Promise<string | null> {
  const context = messages.slice(-CONTEXT_MESSAGES);

  if (context.length === 0) return null;

  try {
    const raw = await complete([{ role: "system", content: SYSTEM }, ...context]);
    const title = normalizeTitle(raw);

    return title.length > 0 ? title : null;
  } catch (error) {
    console.error("[builder] no se pudo generar el titulo del proyecto", { error });
    return null;
  }
}
