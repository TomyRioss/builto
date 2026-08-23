"use client";

import { useTransition } from "react";
import { LuPlus } from "react-icons/lu";
import { toast } from "sonner";

import { isRedirect } from "@/lib/is-redirect";

import { createConversation } from "@/app/dashboard/builder/actions";

export function NewConversationButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await createConversation();
            // Con exito la action redirige y esto no se alcanza.
            if (result && !result.ok) {
              toast.error(result.error ?? "No pudimos crear el proyecto.");
            }
          } catch (error) {
            // NEXT_REDIRECT viaja como excepcion: no es un fallo.
            if (isRedirect(error)) return;
            console.error("[builder] fallo crear conversacion", { error });
            toast.error("No pudimos crear el proyecto.");
          }
        })
      }
      className="inline-flex items-center gap-2 rounded-md bg-[#000000] px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-[#1b1b1b] disabled:opacity-50"
    >
      <LuPlus className="size-4" aria-hidden />
      {isPending ? "Creando" : "Nuevo proyecto"}
    </button>
  );
}
