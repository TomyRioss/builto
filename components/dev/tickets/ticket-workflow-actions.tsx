"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, CircleAlert, Clock3, Play, UserCheck } from "lucide-react";
import type { TicketStatus } from "@/app/generated/prisma/enums";
import { sendTicketToReview, startTicketWork, takeTicket, type DeveloperTicketActionState } from "@/app/dev/projects/[projectId]/actions";
import { getDeveloperTicketAction } from "@/lib/dev/ticket-workflow";

type Props = {
  projectId: string;
  ticketId: string;
  status: TicketStatus;
  assignedDevId: string | null;
  assignedDevName: string | null;
  currentDeveloperId: string;
};

export function TicketWorkflowActions(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<DeveloperTicketActionState | null>(null);
  const action = getDeveloperTicketAction(props.status, props.assignedDevId, props.currentDeveloperId);

  function run(operation: () => Promise<DeveloperTicketActionState>) {
    setResult(null);
    startTransition(async () => {
      const next = await operation();
      setResult(next);
      if (next.ok) router.refresh();
    });
  }

  return (
    <div className="mt-5 border-t border-[#eceeef] pt-5">
      {action === "take" && <button type="button" disabled={pending} onClick={() => run(() => takeTicket(props.projectId, props.ticketId))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] disabled:cursor-wait disabled:opacity-60"><UserCheck aria-hidden="true" className="size-4" />{pending ? "Asignando..." : "Tomar ticket"}</button>}

      {action === "start" && <div><p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#187342]"><UserCheck aria-hidden="true" className="size-4" />Asignado a vos</p><div><button type="button" disabled={pending} onClick={() => run(() => startTicketWork(props.projectId, props.ticketId))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] disabled:cursor-wait disabled:opacity-60"><Play aria-hidden="true" className="size-4" />{pending ? "Iniciando..." : "Iniciar trabajo"}</button></div></div>}

      {action === "work" && <div><p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#187342]"><UserCheck aria-hidden="true" className="size-4" />Asignado a vos</p><div className="flex flex-col gap-3 sm:flex-row"><Link href={`/dashboard/builder?projectId=${props.projectId}&ticketId=${props.ticketId}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#d9dadb] bg-white px-5 text-sm font-medium text-black hover:bg-[#f3f4f5]"><ArrowUpRight aria-hidden="true" className="size-4" />Abrir workspace</Link><button type="button" disabled={pending} onClick={() => run(() => sendTicketToReview(props.projectId, props.ticketId))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-[#242424] disabled:cursor-wait disabled:opacity-60"><CheckCircle2 aria-hidden="true" className="size-4" />{pending ? "Enviando..." : "Enviar a revision"}</button></div></div>}

      {action === "waiting" && <p className="inline-flex items-center gap-2 text-sm font-medium text-[#8a5a00]"><Clock3 aria-hidden="true" className="size-4" />Esperando revision del cliente</p>}
      {action === "complete" && <p className="inline-flex items-center gap-2 text-sm font-medium text-[#187342]"><CheckCircle2 aria-hidden="true" className="size-4" />Ticket completado</p>}
      {action === "readonly" && props.assignedDevId && <p className="text-sm text-[#666768]">Asignado a {props.assignedDevName ?? "otro developer"}. Este ticket esta en modo solo lectura.</p>}
      {action === "readonly" && !props.assignedDevId && props.status !== "DONE" && <p className="text-sm text-[#666768]">Este ticket todavia no esta habilitado para ser tomado.</p>}

      {result?.error && <p role="alert" className="mt-3 inline-flex items-start gap-2 text-sm text-[#b42318]"><CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{result.error}</p>}
      {result?.ok && <p aria-live="polite" className="mt-3 text-sm text-[#187342]">Ticket actualizado correctamente.</p>}
    </div>
  );
}
