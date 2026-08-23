"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuMessageSquare, LuSparkles } from "react-icons/lu";
import { toast } from "sonner";

import { approveReviewedTicket, openReviewAiConversation, requestClientReviewChanges } from "@/app/dashboard/(main)/tickets/actions";

export function ClientReviewActions({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  function approve() { startTransition(async () => { const result = await approveReviewedTicket(ticketId); if (result.ok) { toast.success("Trabajo aprobado y ticket completado."); router.replace(`/dashboard/tickets/${ticketId}`); } else toast.error(result.error); }); }
  function requestChanges() { startTransition(async () => { const result = await requestClientReviewChanges(ticketId, feedback); if (result.ok) { toast.success("Tu mensaje fue enviado al Developer."); router.replace(`/dashboard/tickets/${ticketId}`); } else toast.error(result.error); }); }
  function adjustWithAi() { startTransition(async () => { const result = await openReviewAiConversation(ticketId); if (result.ok && result.conversationId) router.push(`/dashboard/builder/${result.conversationId}?returnTo=${encodeURIComponent(`/dashboard/tickets/${ticketId}/review`)}`); else toast.error(result.error); }); }
  return <div className="rounded-lg border border-[#c9caff] bg-[#fafaff] p-5"><h2 className="font-semibold">Tu revision</h2><p className="mt-2 text-sm leading-6 text-[#666768]">El equipo interno ya reviso la entrega. Podes ajustar detalles con IA antes de decidir.</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" disabled={pending} onClick={adjustWithAi} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#c9caff] bg-white px-4 text-sm font-medium text-[#4648d4]"><LuSparkles className="size-4" />Ajustar con IA</button><button type="button" disabled={pending} onClick={approve} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-4 text-sm font-medium text-white disabled:opacity-50"><LuCheck className="size-4" />Aprobar trabajo</button><button type="button" disabled={pending} onClick={() => setOpen((value) => !value)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d9dadb] bg-white px-4 text-sm font-medium sm:col-span-2"><LuMessageSquare className="size-4" />Pedir cambios al Developer</button></div>{open && <div className="mt-4"><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} maxLength={3000} placeholder="Escribi el mensaje que recibira el Developer..." className="w-full rounded-md border border-[#d9dadb] bg-white p-3 text-sm outline-none focus:border-[#4648d4]" /><button type="button" disabled={pending || feedback.trim().length < 5} onClick={requestChanges} className="mt-2 min-h-10 rounded-md bg-black px-5 text-sm font-medium text-white disabled:opacity-50">Enviar mensaje y pedir cambios</button></div>}</div>;
}
