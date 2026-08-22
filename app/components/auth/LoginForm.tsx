"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { AuthField, FormError } from "./AuthField";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const router = useRouter();
  // proxy.ts manda aca con ?callbackUrl=<ruta protegida> al cortar la sesion.
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(event.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: String(data.get("email") ?? ""),
        password: String(data.get("password") ?? ""),
        redirect: false,
      });

      if (result?.error) {
        console.warn("[auth] login rechazado", { error: result.error });
        setError("Email o contraseña incorrectos.");
        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      console.error("[auth] fallo la request de login", error);
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {error ? <FormError message={error} /> : null}

      <AuthField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="vos@estudio.com"
        required
      />

      <AuthField
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded bg-[#000000] text-sm font-medium text-[#ffffff] hover:bg-[#1b1b1b] focus-visible:ring-[#4648d4]/25"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <div className="flex items-center gap-4">
        <hr className="flex-1 border-0 border-t border-[#cfc4c5]" />
        <span className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
          o
        </span>
        <hr className="flex-1 border-0 border-t border-[#cfc4c5]" />
      </div>

      <GoogleButton onError={setError} redirectTo={callbackUrl} />
    </form>
  );
}
