"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { sendTicketToReview } from "@/app/dev/projects/[projectId]/actions";

type Props = {
  projectId: string;
  ticketId: string;
};

export function WorkspaceReviewButton({ projectId, ticketId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await sendTicketToReview(projectId, ticketId);
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos enviar el ticket a revision.");
        return;
      }
      toast.success("Ticket enviado a revision.");
      router.push(`/dev/projects/${projectId}/tickets/${ticketId}`);
    });
  }

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      className="ml-auto inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-4 text-sm font-medium text-white hover:bg-[#3739b8] disabled:cursor-wait disabled:opacity-60"
    >
      <Send aria-hidden className="size-4" />
      {pending ? "Enviando..." : "Enviar a revision"}
    </button>
  );
}
