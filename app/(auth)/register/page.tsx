import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "../../components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta · Builto",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-[#191c1d] text-balance">
          Crear cuenta
        </h1>
        <p className="text-base leading-6 text-[#4c4546]">
          Empezás con un proyecto vacío y una conversación con Co-Build.
        </p>
      </header>

      <RegisterForm />

      <p className="text-sm leading-5 text-[#4c4546]">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-[#4648d4] underline underline-offset-4 hover:text-[#2f2ebe]"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
