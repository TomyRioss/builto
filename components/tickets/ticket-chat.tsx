"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { sendTicketMessage } from "@/lib/tickets/chat-actions";

type ChatMessage = {
  id: string;
  body: string;
  senderKind: string;
  createdAt: Date;
  sender: { name: string | null; email: string } | null;
};

const timeFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit", hour12: false });
const dateFmt = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "short" });

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function TicketChat({ ticketId, messages, viewerIsStaff }: { ticketId: string; messages: ChatMessage[]; viewerIsStaff: boolean }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = () => {
    const body = value.trim();
    if (!body) return;
    start(async () => {
      const result = await sendTicketMessage(ticketId, body);
      if (result.ok) setValue("");
      else toast.error(result.error);
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-sm font-medium text-[#191c1d]">Todavia no hay mensajes</p>
            <p className="text-sm text-[#7e7576]">Escribi para iniciar la conversacion con {viewerIsStaff ? "el cliente" : "el equipo"}.</p>
          </div>
        )}
        {messages.map((message, index) => {
          const key = dayKey(message.createdAt);
          const showDivider = index === 0 || key !== dayKey(messages[index - 1].createdAt);
          const isAdmin = message.senderKind === "ADMIN";
          return (
            <div key={message.id}>
              {showDivider && (
                <div className="flex items-center gap-3 px-6 pt-6 first:pt-5">
                  <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#7e7576]">{dateFmt.format(message.createdAt)}</span>
                  <span className="h-px flex-1 bg-[#e1e3e4]" />
                </div>
              )}
              <div className="flex items-baseline gap-3 border-b border-[#f3f4f5] px-6 py-4">
                <div className="w-40 shrink-0">
                  <span className="text-sm font-medium text-[#191c1d]">{message.sender?.name ?? message.sender?.email ?? "Sistema"}</span>
                  {isAdmin && <span className="ml-2 rounded bg-[#eef2ff] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#4648d4]">Builto</span>}
                </div>
                <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-[#191c1d]">{message.body}</p>
                <span className="shrink-0 text-xs text-[#7e7576]">{timeFmt.format(message.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(event) => { event.preventDefault(); submit(); }}
        className="flex items-end gap-3 border-t border-[#e1e3e4] bg-[#f8f9fa] px-6 py-4"
      >
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
          placeholder="Escribi un mensaje..."
          rows={1}
          disabled={pending}
          className="min-h-10 flex-1 resize-none rounded border border-[#d9dadb] bg-white px-3 py-2 text-sm leading-6 outline-none placeholder:text-[#7e7576] focus:border-black disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black/85 disabled:pointer-events-none disabled:opacity-40"
        >
          <Send className="size-4" aria-hidden />
          Enviar
        </button>
      </form>
    </div>
  );
}
