"use client";

import { useTransition } from "react";
import { LuArrowRight } from "react-icons/lu";
import { toast } from "sonner";

import { isRedirect } from "@/lib/is-redirect";

import { createConversationFromTemplate } from "@/app/dashboard/builder/actions";

export function UseTemplateButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await createConversationFromTemplate(slug);
            // Con exito la action redirige y esto no se alcanza.
            if (result && !result.ok) {
              toast.error(result.error ?? "No pudimos usar la plantilla.");
            }
          } catch (error) {
            // NEXT_REDIRECT viaja como excepcion: no es un fallo.
            if (isRedirect(error)) return;
            console.error("[builder] fallo crear proyecto desde plantilla", { error });
            toast.error("No pudimos usar la plantilla.");
          }
        })
      }
      className="inline-flex items-center gap-2 rounded-md bg-[#4648d4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3537a8] disabled:opacity-50"
    >
      {isPending ? "Creando proyecto" : "Usar plantilla"}
      <LuArrowRight className="size-4" aria-hidden />
    </button>
  );
}
