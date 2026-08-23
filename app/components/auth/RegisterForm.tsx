"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { registerUser } from "../../(auth)/actions";
import { AuthField, FormError } from "./AuthField";
import { GoogleButton } from "./GoogleButton";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      const result = await registerUser({
        name: String(data.get("name") ?? ""),
        email,
        password,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Cuenta creada: entramos directo, sin pedir las credenciales de nuevo.
      const signedIn = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signedIn?.error) {
        console.warn("[auth] cuenta creada pero el login automatico fallo", {
          error: signedIn.error,
        });
        setError("Creamos tu cuenta. Iniciá sesión para entrar.");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("[auth] fallo el registro", error);
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {error ? <FormError message={error} /> : null}

      <AuthField
        id="name"
        name="name"
        type="text"
        label="Nombre"
        autoComplete="name"
        placeholder="Tomás Rios"
        required
      />

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
        autoComplete="new-password"
        placeholder="••••••••"
        hint="Mínimo 8 caracteres."
        required
      />

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded bg-[#000000] text-sm font-medium text-[#ffffff] hover:bg-[#1b1b1b] focus-visible:ring-[#4648d4]/25"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <div className="flex items-center gap-4">
        <hr className="flex-1 border-0 border-t border-[#cfc4c5]" />
        <span className="text-xs font-semibold uppercase leading-4 tracking-[0.05em] text-[#7e7576]">
          o
        </span>
        <hr className="flex-1 border-0 border-t border-[#cfc4c5]" />
      </div>

      <GoogleButton onError={setError} />
    </form>
  );
}
