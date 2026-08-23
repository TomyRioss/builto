"use client";

import { useEffect, useRef, useState } from "react";
import { LuArrowUp, LuLoader, LuX } from "react-icons/lu";

import type { ChatEntry } from "./useBuilderStream";

type Props = {
  messages: ChatEntry[];
  streamingProse: string;
  isStreaming: boolean;
  onSend: (content: string, images?: string[]) => void;
};

const MAX_IMAGES = 4;
const MAX_TEXTAREA_PX = 240;

export function ChatPanel({ messages, streamingProse, isStreaming, onSend }: Props) {
  const [draft, setDraft] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            <p className="max-w-[65ch] text-base leading-6 text-[#4c4546]">
              Contale que queres construir. La pagina se va a ir armando a la derecha
              mientras la IA escribe. Podes pegar una imagen con Ctrl+V.
            </p>
          )}

          {messages.map((message) => (
            <Bubble key={message.id} mine={message.kind === "USER"} images={message.images}>
              {message.body}
            </Bubble>
          ))}

          {isStreaming && (
            <Bubble mine={false}>
              {streamingProse || (
                <span className="inline-flex items-center gap-2 text-[#4c4546]">
                  <LuLoader
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                  Pensando
                </span>
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
            onClick={submit}
            disabled={isStreaming || draft.trim().length === 0}
            aria-label="Enviar"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#000000] text-[#ffffff] hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isStreaming ? (
              <LuLoader
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
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
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`flex max-w-[85%] flex-col gap-2 rounded-lg px-4 py-3 ${
          mine
            ? "bg-[#000000] text-[#ffffff]"
            : "border border-[#cfc4c5] bg-[#ffffff] text-[#191c1d]"
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
        <p className="whitespace-pre-wrap break-words text-base leading-6">{children}</p>
      </div>
    </div>
  );
}
