"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

import { approveAdminReview, requestAdminReviewChanges } from "@/app/admin/tickets/actions";

export function AdminReviewActions({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [pending, startTransition] = useTransition();

  function approve() { startTransition(async () => { const result = await approveAdminReview(ticketId); if (result.ok) { toast.success("Revision interna aprobada. Ahora debe revisar el cliente."); router.refresh(); } else toast.error(result.error); }); }
  function requestChanges() { startTransition(async () => { const result = await requestAdminReviewChanges(ticketId, feedback); if (result.ok) { toast.success("Feedback enviado al Developer."); router.push(`/admin/tickets/${ticketId}`); } else toast.error(result.error); }); }

  return <div className="space-y-3"><button type="button" disabled={pending} onClick={approve} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#4648d4] px-4 text-sm font-medium text-white disabled:opacity-50"><CheckCircle2 className="size-4" />{pending ? "Procesando..." : "Aprobar revision interna"}</button><button type="button" disabled={pending} onClick={() => setShowFeedback((value) => !value)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#d9dadb] px-4 text-sm font-medium"><MessageSquareWarning className="size-4" />Pedir cambios</button>{showFeedback && <div><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} maxLength={3000} placeholder="Explica que debe corregir el Developer..." className="w-full rounded-md border border-[#d9dadb] p-3 text-sm outline-none focus:border-[#4648d4]" /><button type="button" disabled={pending || feedback.trim().length < 5} onClick={requestChanges} className="mt-2 min-h-10 w-full rounded-md bg-black px-4 text-sm font-medium text-white disabled:opacity-50">Enviar feedback</button></div>}</div>;
}
