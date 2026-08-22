import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "../../components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar · Builto",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-[#191c1d] text-balance">
          Entrar
        </h1>
        <p className="text-base leading-6 text-[#4c4546]">
          Volvé a tus proyectos y a tus conversaciones con Co-Build.
        </p>
      </header>

      {/* useSearchParams (callbackUrl) necesita boundary para prerenderizar. */}
      <Suspense fallback={<div className="h-[420px]" />}>
        <LoginForm />
      </Suspense>

      <p className="text-sm leading-5 text-[#4c4546]">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-[#4648d4] underline underline-offset-4 hover:text-[#2f2ebe]"
        >
          Crear una
        </Link>
      </p>
    </div>
  );
}
