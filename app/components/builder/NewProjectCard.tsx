"use client";

import { useTransition } from "react";
import { LuPlus } from "react-icons/lu";
import { toast } from "sonner";

import { isRedirect } from "@/lib/is-redirect";

import { createConversation } from "@/app/dashboard/builder/actions";

/** Siempre crea una conversacion nueva: nunca navega a /dashboard/builder (ese cae en la ultima existente). */
export function NewProjectCard() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await createConversation();
            if (result && !result.ok) {
              toast.error(result.error ?? "No pudimos crear el proyecto.");
            }
          } catch (error) {
            if (isRedirect(error)) return;
            console.error("[builder] fallo crear conversacion", { error });
            toast.error("No pudimos crear el proyecto.");
          }
        })
      }
      className="flex h-40 flex-col justify-between rounded-lg bg-[#6063ee] p-6 text-left transition-opacity hover:opacity-95 disabled:opacity-60"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-white/20 text-[#ffffff]">
        <LuPlus className="size-4" aria-hidden />
      </span>
      <span>
        <span className="block text-base font-medium leading-6 text-[#ffffff]">
          {isPending ? "Creando..." : "Crear nuevo proyecto"}
        </span>
        <span className="mt-1 block text-sm leading-5 text-[#ffffff]/80">
          Empeza un nuevo chat con la IA.
        </span>
      </span>
    </button>
  );
}
