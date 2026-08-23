const ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
/** Unico modelo con vision; los demas rechazan image_url con 400. */
const VISION_MODEL = "deepseek-v4-flash-vision-exp";

function configuredModel() {
  return process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL;
}

function hasImages(messages: ChatMessage[]): boolean {
  return messages.some(
    (m) => Array.isArray(m.content) && m.content.some((p) => p.type === "image_url"),
  );
}

function errorDetail(error: unknown) {
  return error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };
}

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
};

export function buildImagePrompt(imageUrls: string[]): string {
  const list = imageUrls.map((url, i) => `${i + 1}. ${url}`).join("\n");

  return `Imagenes que el usuario subio en este turno:
${list}

Para usarlas en el sitio, metelas con \`<img src="ESA_URL">\` copiando la URL exacta, sin modificarla ni acortarla. No inventes otras URLs para estas imagenes.`;
}

export function buildSystemPrompt(
  files: Record<string, string>,
  purpose?: string | null,
  imageUrls?: string[],
): string {
  const tree = Object.keys(files).sort().join("\n");
  const contents = Object.entries(files)
    .map(([path, content]) => `<file path="${path}">\n${content}</file>`)
    .join("\n");

  const purposeBlock = purpose?.trim()
    ? `Proposito del sitio (el objetivo real detras del pedido, priorizalo por sobre pedidos puntuales que lo contradigan sin querer): ${purpose.trim()}\n\n`
    : "";

  const imagesBlock = imageUrls && imageUrls.length > 0 ? `${buildImagePrompt(imageUrls)}\n\n` : "";

  return `Sos Co-Build, el generador de sitios de Builto. Construis una app Vite + React + TypeScript + Tailwind para el usuario.

${purposeBlock}\
${imagesBlock}\

Reglas de salida, sin excepcion:
- Escribi en español rioplatense, segunda persona, directo y corto. Sin exclamaciones ni lenguaje de marketing.
- Orden estricto: primero TODOS los bloques \`<file>\` que necesites, la prosa va SIEMPRE al final, despues de cerrar el ultimo archivo. Nunca antes ni entre bloques: el usuario ve la prosa como "ya hecho" y no debe leerla antes de que el archivo este escrito de verdad.
- La prosa final es solo una nota de contexto, en pasado, de una o dos frases: QUE cambiaste realmente (sin nombrar variables ni pegar codigo, sin bloques \`\`\`). Nunca es la respuesta en si ni reemplaza al codigo.
- PROHIBIDO decir que cambiaste algo sin haber emitido el bloque \`<file>\` correspondiente en el MISMO turno. Si el pedido requiere tocar codigo, primero emiti los bloques \`<file>\` con el cambio real; recien despues la prosa lo resume. Nunca prosa sola simulando un cambio que no hiciste.
- Para tocar archivos usa exactamente este formato, uno por archivo:
<file path="/src/App.tsx">
CONTENIDO COMPLETO DEL ARCHIVO
</file>
- Siempre el archivo entero, nunca un diff ni "...resto igual".
- Solo tocá los archivos que cambian. Si el pedido no toca codigo, no emitas ningun bloque.

Pedidos demasiado complejos para vos:
- Hay tareas que exceden lo que un sitio Vite + React sin backend puede cumplir de verdad: pasarelas de pago o cobros con dinero real, autenticacion con cuentas y sesiones, bases de datos o backends propios, integraciones con APIs externas que requieran credenciales o claves secretas, y cualquier logica de negocio multi-paso de ese nivel.
- Si el pedido entra en esa categoria, NO lo intentes: nada de simular la funcionalidad con datos falsos ni emitir bloques <file> que parezcan resolverla.
- En su lugar respondé solo prosa, dos o tres frases: deci que es una tarea compleja que probablemente se escapa de tus capacidades y que lo mejor es abrir un ticket para que lo haga un desarrollador.
- En ese caso cerra el mensaje con el tag <ticket_suggestion>, una sola vez: solo la apertura, sin contenido ni cierre. En cualquier otro caso prohibido usar ese tag.

Reglas del codigo:
- /src/App.tsx tiene el default export y es la pagina.
- Componentes nuevos en /src/components/Nombre.tsx con default export.
- Componentes de UI reutilizables (estilo shadcn/ui) en /src/components/ui/. Ya existe Button; podes agregar mas pegando el codigo fuente de shadcn/ui.
- Importa SIEMPRE con el alias "@/": "@/components/ui/button", "@/lib/utils". Esta configurado en vite.config.js y tsconfig.json y apunta a /src. Nada de "../../lib/utils".
- Helper cn() en /src/lib/utils.ts. Usalo para combinar clases.
- Muchos componentes de shadcn/ui dependen de un paquete @radix-ui distinto (dialog -> @radix-ui/react-dialog, select -> @radix-ui/react-select, etc). Si agregas uno, sumá su paquete a /package.json en el mismo turno o el sandbox no compila.
- Estilos: solo clases de Tailwind. Nada de CSS suelto, style inline ni archivos .css nuevos.
- Responsive siempre: mobile y desktop. Espaciado multiplo de 4px.
- Accesible: alt en imagenes, foco visible, contraste alto.
- Nada de SVG escrito a mano. Iconos: react-icons o lucide-react, los dos ya instalados. Imagenes: URLs reales de Unsplash o Pexels.

Navegacion multipagina:
- react-router-dom ya esta instalado. Usa SIEMPRE HashRouter (nunca BrowserRouter): el sandbox corre en un iframe y BrowserRouter (History API) no anda ahi.

Dependencias:
- Ya instalados: react, react-dom, react-icons, lucide-react, react-router-dom, @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge.
- Para sumar una dependencia, reescribi /package.json entero con el paquete agregado. El sandbox la instala solo. Usalo con criterio: cada dependencia nueva hace mas lento el arranque.

Version del stack, respetala:
- Tailwind v3, NO v4. La config vive en /tailwind.config.js, no en CSS. Nada de @theme ni @import "tailwindcss".
- React 19, Vite 4, TypeScript.

Archivos actuales del proyecto:
${tree}

${contents}`;
}

/** POST a DeepSeek con la key del entorno. Tira si la respuesta no es 2xx. */
async function post(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("Falta DEEPSEEK_API_KEY en el entorno. Revisa .env.local");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: hasImages((body.messages as ChatMessage[]) ?? []) ? VISION_MODEL : configuredModel(),
      ...body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`DeepSeek respondio ${response.status}: ${detail.slice(0, 500)}`);
  }

  return response;
}

/**
 * Abre el stream de DeepSeek (API compatible con OpenAI) y devuelve los deltas
 * de texto ya desempaquetados del SSE.
 */
export async function streamCompletion(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<AsyncGenerator<string>> {
  // Sin esto DeepSeek usa su default (4096 tokens) y corta a mitad de archivo
  // en sitios grandes (varios componentes completos); 8192 es el max real de
  // la API para este modelo.
  const response = await post({ messages, stream: true, temperature: 0.3, max_tokens: 8192 }, signal);

  if (!response.body) {
    throw new Error("DeepSeek respondio sin cuerpo.");
  }

  return readDeltas(response.body);
}

/**
 * Una respuesta corta, sin streaming. Para pedidos auxiliares (titulos), no
 * para el turno de la conversacion.
 */
export async function complete(
  messages: ChatMessage[],
  maxTokens = 24,
): Promise<string> {
  const response = await post({
    messages,
    stream: false,
    temperature: 0.3,
    max_tokens: maxTokens,
  });

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  return typeof content === "string" ? content.trim() : "";
}

async function* readDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // El SSE separa eventos con linea en blanco; el ultimo trozo puede venir
      // cortado al medio, por eso queda en el buffer hasta la proxima vuelta.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;

        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;

        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch (error) {
          console.error("[deepseek] evento SSE ilegible", { payload, ...errorDetail(error) });
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
