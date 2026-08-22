"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";

export function GoogleButton({
  onError,
  redirectTo = "/dashboard",
}: {
  onError: (msg: string) => void;
  redirectTo?: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signIn("google", { redirectTo });
    } catch (error) {
      console.error("[auth] fallo el inicio con Google", error);
      onError("No pudimos abrir Google. Probá de nuevo.");
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
      className="h-11 w-full gap-2 rounded border-[#cfc4c5] bg-[#ffffff] text-sm font-medium text-[#191c1d] hover:bg-[#f3f4f5] focus-visible:border-[#4648d4] focus-visible:ring-[#4648d4]/25"
    >
      <FcGoogle className="size-4" aria-hidden />
      {pending ? "Abriendo Google…" : "Continuar con Google"}
    </Button>
  );
}
