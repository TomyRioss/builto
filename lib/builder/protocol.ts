/**
 * Protocolo entre la IA y el proyecto.
 *
 * La IA contesta prosa y, cuando toca codigo, emite bloques:
 *
 *   <file path="/App.tsx">
 *   ...contenido completo del archivo...
 *   </file>
 *
 * El codigo nunca entra a `Message.body`: la prosa va al chat y los bloques
 * van a `ProjectFile`. El mismo parser corre en el cliente sobre el stream a
 * medio recibir (por eso el cierre `</file>` es opcional) y en el server al
 * terminar, para persistir.
 */

// Tolera espacios/saltos raros alrededor de path= (glitches del stream de la
// IA), y ademas "<｜｜DSML｜｜ path=...>": token especial propio de DeepSeek
// que a veces sale en vez de "<file" pero cumple la misma funcion.
const FILE_BLOCK =
  /<(?:file|｜｜DSML｜｜)\s+path\s*=\s*"([^"]+)"\s*>\n?([\s\S]*?)(<\/(?:file|｜｜DSML｜｜)>|$)/g;

/** Etiqueta de apertura cortada al medio por el stream: "<file pa" o "<｜｜DS" */
const DANGLING_TAG = /<(?:f(?:i(?:l(?:e[^>]*)?)?)?|｜{0,2}D?S?M?L?｜{0,2}|t(?:i(?:c(?:k(?:e(?:t[^>]*)?)?)?)?)?)?$/;

/**
 * Tag que la IA emite cuando el pedido es tan complejo que prefiere derivar a
 * un desarrollador via ticket. Puede llegar como apertura sola o con cierre.
 * Se saca de la prosa: la UI usa la bandera para pintar los botones.
 */
export const TICKET_SUGGESTION_TAG = "<ticket_suggestion>";

const TICKET_SUGGESTION =
  /<ticket_suggestion\b[^>]*>(?:\s*<\/ticket_suggestion>)?/g;

/**
 * A veces el stream de la IA corrompe el tag `<file path="...">` (glitch de
 * tokens) y el contenido del archivo cae como si fuera prosa: se ve como
 * codigo crudo en el chat. Deteccion heuristica por parrafo para que ese
 * texto nunca llegue al usuario ni se persista.
 */
const CODE_LIKE_PARAGRAPH =
  /(^|\n)\s*(import\s.+from\s|export\s+default\s|export\s+function\s|export\s+const\s|interface\s+\w+\s*\{|return\s*\(|className=|<\/?[A-Za-z][\w.]*(\s|>))/;

function stripCodeLeakage(text: string): string {
  const cleaned = text
    .split(/\n{2,}/)
    .filter((paragraph) => !CODE_LIKE_PARAGRAPH.test(paragraph))
    .join("\n\n")
    .trim();

  if (cleaned !== text.trim() && text.trim()) {
    console.warn("[builder] prosa con pinta de codigo filtrada (glitch de tags)", {
      original: text.slice(0, 200),
    });
  }

  return cleaned;
}

/**
 * Marcador invisible que el server inyecta en el stream (fuera de la prosa y
 * de cualquier `<file>`) cuando arranca una continuacion por archivo cortado.
 * El cliente lo detecta y lo saca del texto antes de mostrarlo o parsearlo.
 */
export const CONTINUE_MARKER = "builto:continuing";

export type ParsedReply = {
  /** Solo prosa. Es lo que se guarda en `Message.body` y se muestra en el chat. */
  prose: string;
  /** path -> contenido. Incluye el bloque abierto, que sale ademas en `openPath`. */
  files: Record<string, string>;
  /**
    * Archivo que la IA todavia esta escribiendo, o `null` si cerro todos.
    * El preview lo usa para no compilar TSX cortado al medio.
    */
   openPath: string | null;
  /**
   * True si la IA derivo el pedido a un ticket con desarrollador (tarea
   * demasiado compleja). El chat lo usa para mostrar los botones de accion.
   */
  suggestTicket: boolean;
};

export function normalizePath(path: string): string {
  const trimmed = path.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function parseReply(raw: string): ParsedReply {
  const files: Record<string, string> = {};
  let openPath: string | null = null;
  let suggestTicket = false;

  const prose = stripCodeLeakage(
    raw
      .replace(FILE_BLOCK, (_match, path: string, content: string, closing: string) => {
        const normalized = normalizePath(path);
        files[normalized] = content;
        openPath = closing ? null : normalized;
        return "";
      })
      .replace(TICKET_SUGGESTION, () => {
        suggestTicket = true;
        return "";
      })
      // Sin esto el chat parpadea con "<fil" cada vez que arranca un bloque.
      .replace(DANGLING_TAG, ""),
  );

  return { prose, files, openPath, suggestTicket };
}

const CODE_CHANGE_REQUEST =
  /\b(agreg|anad|añad|cambi|modific|elimin|quit|sac|crea|implement|disen|diseñ|redisen|rediseñ|pon|actualiz|reemplaz|move|remove|add|change|update|create|build|make|delete|implement)\w*/i;

/** Detecta respuestas que prometen una edicion pero no entregan ningun archivo. */
export function shouldRetryMissingFiles(raw: string, userMessage: string): boolean {
  const parsed = parseReply(raw);
  return (
    CODE_CHANGE_REQUEST.test(userMessage) &&
    !parsed.openPath &&
    !parsed.suggestTicket &&
    Object.keys(parsed.files).length === 0
  );
}
