"use client";

import { useEffect, useRef, useState } from "react";
import { LuArrowUp, LuLoader, LuX } from "react-icons/lu";
import { toast } from "sonner";

import type { ChatEntry } from "./useBuilderStream";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { NewTicketDialog } from "@/app/components/tickets/NewTicketDialog";

type Props = {
  messages: ChatEntry[];
  streamingProse: string;
  isStreaming: boolean;
  writingPath?: string | null;
  isFixing?: boolean;
  files?: Record<string, string>;
  projectId: string;
  projectName: string;
  onSend: (content: string, images?: string[]) => void;
};

const MAX_IMAGES = 4;
const MAX_TEXTAREA_PX = 240;
const PAGE_SUGGESTIONS = ["Landing page", "Dashboard", "Portfolio", "Tienda online"] as const;

type BusinessProfile = {
  name: string;
  description: string;
  goal: string;
};

function optimizedPrompt(pageType: string, profile: BusinessProfile) {
  return `Construí una página web completa de tipo ${pageType.toLowerCase()} para ${profile.name.trim()}.

Sobre el negocio: ${profile.description.trim()}
Objetivo de la página: ${profile.goal.trim()}

Usá esta información como base real del contenido y de las decisiones visuales. No inventes datos específicos del negocio que no estén indicados.

Incluí una estructura profesional con navegación, hero principal, propuesta de valor, secciones relevantes para este negocio, llamados a la acción claros, prueba social y footer.

Definí una identidad visual coherente con la marca, buena jerarquía tipográfica, espaciado cuidado, estados hover y foco, diseño responsive para mobile y desktop, y contraste accesible.

Generá todos los archivos necesarios del sitio en el formato esperado por Builto. Priorizá una experiencia terminada, realista y lista para personalizar.`;
}

function profilePrompt(pageType: string, profile: BusinessProfile) {
  if (!profile.name.trim() || !profile.description.trim() || !profile.goal.trim()) return "";
  return optimizedPrompt(pageType, profile);
}

export function ChatPanel({
  messages,
  streamingProse,
  isStreaming,
  writingPath,
  isFixing,
  files,
  projectId,
  projectName,
  onSend,
}: Props) {
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "",
    description: "",
    goal: "",
  });
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [rippleKey, setRippleKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const businessRef = useRef<HTMLInputElement>(null);
  const streamingWords = streamingProse.match(/\S+\s*/g) ?? [];

  useEffect(() => {
    if (!streamingProse) {
      const reset = window.setTimeout(() => setVisibleWordCount(0), 0);
      return () => window.clearTimeout(reset);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const reveal = window.setTimeout(() => setVisibleWordCount(streamingWords.length), 0);
      return () => window.clearTimeout(reveal);
    }

    const clamp = window.setTimeout(
      () => setVisibleWordCount((current) => Math.min(current, streamingWords.length)),
      0,
    );
    const interval = window.setInterval(() => {
      setVisibleWordCount((current) => {
        if (current >= streamingWords.length) return current;
        return current + 1;
      });
    }, 35);

    return () => {
      window.clearTimeout(clamp);
      window.clearInterval(interval);
    };
  }, [streamingProse, streamingWords.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, streamingProse]);

  // Auto-resize: prompts largos no quedan atrapados en una caja de una linea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }, [draft]);

  function addImages(files: File[]) {
    const room = MAX_IMAGES - pendingImages.length;
    if (room <= 0) return;

    files.slice(0, room).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPendingImages((prev) =>
            prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string],
          );
        }
      };
      reader.onerror = () => {
        console.error("[builder] no se pudo leer la imagen pegada", { name: file.name });
      };
      reader.readAsDataURL(file);
    });
  }

  function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length === 0) return;
    event.preventDefault();
    addImages(files);
  }

  function removeImage(index: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    const text = draft.trim();
    if ((!text && pendingImages.length === 0) || isStreaming) return;
    if (!text) return; // el backend exige texto; una imagen sola no alcanza
    setDraft("");
    const images = pendingImages;
    setPendingImages([]);
    onSend(text, images.length > 0 ? images : undefined);
  }

  return (
    <section className="flex min-h-0 w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] md:w-[440px] md:border-b-0 md:border-r lg:w-[480px]">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6">
          {messages.length === 0 && !isStreaming && (
            <>
              <p className="max-w-[65ch] text-base leading-6 text-[#4c4546]">
                Contale que queres construir. La pagina se va a ir armando a la derecha
                mientras la IA escribe.
              </p>
              <div className="flex flex-wrap gap-2" aria-label="Sugerencias rápidas">
                {PAGE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                     onClick={() => {
                       setSelectedSuggestion(suggestion);
                       setBusinessProfile({ name: "", description: "", goal: "" });
                       setDraft("");
                      requestAnimationFrame(() => {
                        businessRef.current?.focus();
                      });
                    }}
                    className={`rounded-md border border-[#000000] px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4] ${selectedSuggestion === suggestion ? "bg-[#6063ee] text-[#ffffff]" : "text-[#191c1d] hover:bg-[#6063ee] hover:text-[#ffffff]"}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              {selectedSuggestion && (
                <div className="max-w-[32rem] space-y-4">
                  <div>
                    <label htmlFor="business-name" className="mb-2 block text-sm font-medium text-[#191c1d]">
                      ¿Cuál es el nombre de tu negocio?
                    </label>
                    <input
                      ref={businessRef}
                      id="business-name"
                      value={businessProfile.name}
                      onChange={(event) => {
                        const profile = { ...businessProfile, name: event.target.value };
                        setBusinessProfile(profile);
                        setDraft(profilePrompt(selectedSuggestion, profile));
                      }}
                      placeholder="Ej: Estudio Norte"
                      className="w-full rounded-md border border-[#cfc4c5] bg-white px-3 py-2.5 text-sm text-[#191c1d] outline-none placeholder:text-[#7e7576] focus:border-[#4648d4]"
                    />
                  </div>
                  <div>
                    <label htmlFor="business-description" className="mb-2 block text-sm font-medium text-[#191c1d]">
                      Contanos sobre tu negocio
                    </label>
                    <textarea
                      id="business-description"
                      value={businessProfile.description}
                      onChange={(event) => {
                        const profile = { ...businessProfile, description: event.target.value };
                        setBusinessProfile(profile);
                        setDraft(profilePrompt(selectedSuggestion, profile));
                      }}
                      placeholder="Qué hacés, para quién trabajás y qué te diferencia"
                      rows={3}
                      className="w-full resize-y rounded-md border border-[#cfc4c5] bg-white px-3 py-2.5 text-sm leading-5 text-[#191c1d] outline-none placeholder:text-[#7e7576] focus:border-[#4648d4]"
                    />
                  </div>
                  <div>
                    <label htmlFor="business-goal" className="mb-2 block text-sm font-medium text-[#191c1d]">
                      ¿Qué querés conseguir con la página?
                    </label>
                    <textarea
                      id="business-goal"
                      value={businessProfile.goal}
                      onChange={(event) => {
                        const profile = { ...businessProfile, goal: event.target.value };
                        setBusinessProfile(profile);
                        setDraft(profilePrompt(selectedSuggestion, profile));
                      }}
                      placeholder="Ej: recibir consultas y mostrar mis trabajos"
                      rows={2}
                      className="w-full resize-y rounded-md border border-[#cfc4c5] bg-white px-3 py-2.5 text-sm leading-5 text-[#191c1d] outline-none placeholder:text-[#7e7576] focus:border-[#4648d4]"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#7e7576]">
                    Vamos a usar esta información para preparar el contenido de tu sitio.
                  </p>
                </div>
              )}
            </>
          )}

          {messages.map((message) => (
            <Bubble key={message.id} mine={message.kind === "USER"} images={message.images}>
              <MessageBody text={message.body} mine={message.kind === "USER"} />
              {message.kind === "AI" && message.suggestTicket && (
                <TicketSuggestionActions projectId={projectId} projectName={projectName} />
              )}
            </Bubble>
          ))}

          {isStreaming && messages[messages.length - 1]?.kind !== "AI" && (
            <Bubble mine={false}>
              {streamingProse && !writingPath && !isFixing ? (
                <MessageBody text={streamingWords.slice(0, visibleWordCount).join("")} mine={false} />
              ) : (
                <ThinkingIndicator
                  writingPath={writingPath}
                  fileExists={Boolean(writingPath && files && writingPath in files)}
                  fixing={isFixing}
                />
              )}
            </Bubble>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-[#cfc4c5] px-4 py-4 md:px-8">
        {pendingImages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {pendingImages.map((src, index) => (
              <div key={index} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Imagen adjunta ${index + 1}`}
                  className="size-16 rounded-md border border-[#cfc4c5] object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Quitar imagen"
                  className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-[#000000] text-[#ffffff]"
                >
                  <LuX className="size-3" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3 rounded-lg border border-[#cfc4c5] px-4 py-3 focus-within:border-[#4648d4]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPaste={handlePaste}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            disabled={isStreaming}
            placeholder="Escribi que queres construir"
            aria-label="Mensaje para la IA"
            className="min-h-6 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent text-base leading-6 text-[#191c1d] outline-none placeholder:text-[#7e7576] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => {
              if (isStreaming || !draft.trim()) return;
              setRippleKey((current) => current + 1);
              submit();
            }}
            disabled={isStreaming || draft.trim().length === 0}
            aria-label="Enviar"
            className={`relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md text-[#ffffff] transition-colors ${
              isStreaming
                ? "cursor-progress bg-[#6063ee] motion-safe:animate-pulse"
                : draft.trim()
                  ? "bg-[#6063ee] hover:bg-[#4648d4]"
                  : "cursor-not-allowed bg-[#7e7576]"
            }`}
          >
            {rippleKey > 0 && (
              <span
                key={rippleKey}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-md border-2 border-[#c0c1ff] motion-safe:animate-ping"
              />
            )}
            {isStreaming ? (
              <LuLoader className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <LuArrowUp className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function Bubble({
  mine,
  images,
  children,
}: {
  mine: boolean;
  images?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className={mine ? "flex flex-col items-end" : "flex flex-col items-start"}>
      <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9b9d]">
        {mine ? "Vos" : "Builto"}
      </span>
      <div
        className={`flex max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 ${
          mine
            ? "rounded-br-md bg-[#191c1d] text-[#ffffff] shadow-[0_8px_20px_-14px_rgba(15,23,42,0.8)]"
            : "rounded-bl-md border border-[#e4e6e8] bg-[#ffffff] text-[#191c1d] shadow-[0_4px_14px_-12px_rgba(15,23,42,0.35)]"
        }`}
      >
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={src}
                alt={`Imagen adjunta ${index + 1}`}
                className="size-24 rounded-md object-cover"
              />
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function MessageBody({ text, mine }: { text: string; mine: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 420;

  return (
    <div>
      <p className={`whitespace-pre-wrap break-words text-sm leading-6 ${isLong && !expanded ? "line-clamp-7" : ""}`}>
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`mt-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${mine ? "text-[#aeb0ff] hover:text-white focus-visible:outline-white" : "text-[#4648d4] hover:text-[#191c1d] focus-visible:outline-[#4648d4]"}`}
        >
          {expanded ? "Ver menos" : "Ver mensaje completo"}
        </button>
      )}
    </div>
  );
}

/**
 * Botones que acompanan la respuesta de la IA cuando deriva un pedido muy
 * complejo a un ticket: "Abrir ticket" abre el wizard ya fijado al proyecto
 * actual y "Omitir" esconde la sugerencia.
 */
function TicketSuggestionActions({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-md bg-[#7c3aed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] transition-colors hover:bg-[#6d28d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"
        >
          Abrir ticket
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-md border border-[#191c1d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#191c1d] transition-colors hover:bg-[#edeeef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"
        >
          Omitir
        </button>
      </div>
      <NewTicketDialog
        projects={[{ id: projectId, name: projectName, thumbnail: null }]}
        externalOpen={dialogOpen}
        onExternalClose={() => setDialogOpen(false)}
      />
    </>
  );
}
