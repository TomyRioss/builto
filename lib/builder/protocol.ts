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

const FILE_BLOCK = /<file path="([^"]+)">\n?([\s\S]*?)(<\/file>|$)/g;

/** Etiqueta de apertura cortada al medio por el stream: "<file pa" */
const DANGLING_TAG = /<(?:f(?:i(?:l(?:e[^>]*)?)?)?)?$/;

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
};

export function normalizePath(path: string): string {
  const trimmed = path.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function parseReply(raw: string): ParsedReply {
  const files: Record<string, string> = {};
  let openPath: string | null = null;

  const prose = raw
    .replace(FILE_BLOCK, (_match, path: string, content: string, closing: string) => {
      const normalized = normalizePath(path);
      files[normalized] = content;
      openPath = closing ? null : normalized;
      return "";
    })
    // Sin esto el chat parpadea con "<fil" cada vez que arranca un bloque.
    .replace(DANGLING_TAG, "");

  return { prose: prose.trim(), files, openPath };
}
