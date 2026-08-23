import { complete, type ChatMessage } from "./deepseek";

/** Cada cuantos mensajes se refina el proposito del chat. */
export const REFINE_EVERY = 5;

const PER_TURN = 2;
const CONTEXT_MESSAGES = 6;
const MAX_LENGTH = 240;

/** Mismo criterio de "cruce" que title.ts: dispara ~cada REFINE_EVERY mensajes. */
export function shouldRefinePurpose(totalMessages: number): boolean {
  if (totalMessages < REFINE_EVERY) return false;

  const before = totalMessages - PER_TURN;
  return Math.floor(totalMessages / REFINE_EVERY) > Math.floor(before / REFINE_EVERY);
}

const SYSTEM = `Mantenes actualizado el "proposito" de un chat donde un usuario le pide a una IA que construya un sitio web.

El proposito es el objetivo real detras del sitio: para que es, para quien, que tiene que lograr. No es un resumen de la conversacion ni una lista de features.

Te paso el proposito actual (puede venir vacio) y los ultimos mensajes. Devolve el proposito actualizado: la misma idea si nada cambio, o la version corregida si el usuario giro el objetivo.

Reglas:
- Solo el texto del proposito, nada mas. Sin comillas, sin prefijos tipo "Proposito:".
- Español, 1-2 frases, maximo ${MAX_LENGTH} caracteres.
- Si todavia no hay info suficiente para inferirlo, devolve string vacio.`;

/** Recorta y limpia. Vacio si no sirve. */
function normalize(raw: string): string {
  const clean = raw.trim().replace(/^["'`]+|["'`.]+$/g, "").replace(/\s+/g, " ").trim();
  if (clean.length === 0) return "";
  return clean.length > MAX_LENGTH ? `${clean.slice(0, MAX_LENGTH - 1).trimEnd()}…` : clean;
}

/**
 * Pide al modelo el proposito refinado. `null` ante cualquier problema: esto
 * es accesorio y no puede romper el turno del usuario.
 */
export async function refinePurpose(
  previousPurpose: string | null,
  messages: ChatMessage[],
): Promise<string | null> {
  const context = messages.slice(-CONTEXT_MESSAGES);
  if (context.length === 0) return null;

  try {
    const raw = await complete(
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Proposito actual: ${previousPurpose?.trim() || "(vacio)"}`,
        },
        ...context,
      ],
      120,
    );

    const purpose = normalize(raw);
    return purpose.length > 0 ? purpose : null;
  } catch (error) {
    console.error("[builder] no se pudo refinar el proposito del chat", { error });
    return null;
  }
}
