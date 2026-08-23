"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { parseReply } from "@/lib/builder/protocol";

export type ChatEntry = {
  id: string;
  kind: "USER" | "AI";
  body: string;
  images?: string[];
};

/** Cada cuanto se re-parsea el stream. Menos que esto solo quema renders. */
const FLUSH_MS = 120;

export function useBuilderStream({
  conversationId,
  initialMessages,
  initialFiles,
}: {
  conversationId: string;
  initialMessages: ChatEntry[];
  initialFiles: Record<string, string>;
}) {
  const router = useRouter();

  const [messages, setMessages] = useState(initialMessages);
  const [files, setFiles] = useState(initialFiles);
  const [syncedWith, setSyncedWith] = useState(initialMessages);
  const [streamingProse, setStreamingProse] = useState("");
  const [writingPath, setWritingPath] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const rawRef = useRef("");
  const flushRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El server es la verdad: cuando router.refresh() trae mensajes o archivos
  // nuevos, el estado local se resincroniza. Ajuste en render, no en efecto:
  // https://react.dev/learn/you-might-not-need-an-effect
  if (syncedWith !== initialMessages) {
    setSyncedWith(initialMessages);
    setMessages(initialMessages);
    setFiles(initialFiles);
  }

  useEffect(() => {
    return () => {
      if (flushRef.current) clearTimeout(flushRef.current);
    };
  }, []);

  const flush = useCallback(() => {
    flushRef.current = null;

    const { prose, files: parsed, openPath } = parseReply(rawRef.current);

    setStreamingProse(prose);
    setWritingPath(openPath);

    // El archivo abierto tiene TSX cortado al medio: compilarlo solo genera
    // un overlay de error parpadeando. Entra al preview recien cuando cierra.
    const complete = Object.fromEntries(
      Object.entries(parsed).filter(([path]) => path !== openPath),
    );

    if (Object.keys(complete).length > 0) {
      setFiles((prev) => ({ ...prev, ...complete }));
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushRef.current) return;
    flushRef.current = setTimeout(flush, FLUSH_MS);
  }, [flush]);

  const send = useCallback(
    async (content: string, images?: string[]) => {
      const text = content.trim();
      if (!text || isStreaming) return;

      rawRef.current = "";
      setStreamingProse("");
      setWritingPath(null);
      setIsStreaming(true);
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, kind: "USER", body: text, images },
      ]);

      const startedAt = performance.now();
      let firstChunkAt: number | null = null;

      try {
        const response = await fetch(`/api/builder/${conversationId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, images }),
        });

        if (!response.ok || !response.body) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.error ?? `El servidor respondio ${response.status}.`);
        }

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          firstChunkAt ??= performance.now();
          rawRef.current += value;
          scheduleFlush();
        }

        if (flushRef.current) {
          clearTimeout(flushRef.current);
          flushRef.current = null;
        }
        flush();
        console.info("[builder] respuesta recibida", {
          conversationId,
          firstChunkMs: firstChunkAt === null ? null : Math.round(firstChunkAt - startedAt),
          streamMs: Math.round(performance.now() - startedAt),
          receivedChars: rawRef.current.length,
        });
      } catch (error) {
        console.error("[builder] fallo el turno de la IA", {
          conversationId,
          recibido: rawRef.current.length,
          error,
        });
        toast.error(
          error instanceof Error ? error.message : "No pudimos hablar con la IA.",
        );
      } finally {
        setIsStreaming(false);
        setStreamingProse("");
        setWritingPath(null);
        rawRef.current = "";
        // Trae de la DB el mensaje de la IA y los archivos ya persistidos.
        router.refresh();
      }
    },
    [conversationId, flush, isStreaming, router, scheduleFlush],
  );

  return {
    messages,
    files,
    streamingProse,
    writingPath,
    isStreaming,
    send,
  };
}
