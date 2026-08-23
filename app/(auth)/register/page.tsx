import { createHash } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "../../components/auth/RegisterForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Crear cuenta · Builto",
};

export default async function RegisterPage(props: PageProps<"/register">) {
  const searchParams = await props.searchParams;
  const rawInvite = typeof searchParams.invite === "string" ? searchParams.invite : undefined;
  const invite = rawInvite ? await prisma.invite.findUnique({ where: { token: createHash("sha256").update(rawInvite).digest("hex") }, select: { email: true, role: true, expiresAt: true, acceptedAt: true } }) : null;
  const validInvite = invite && !invite.acceptedAt && invite.expiresAt > new Date() && (invite.role === "DEV" || invite.role === "ADMIN") ? invite : null;

  if (rawInvite && !validInvite) {
    return <div className="flex flex-col gap-4"><h1 className="text-3xl font-semibold">Invitacion no disponible</h1><p className="text-sm leading-6 text-[#4c4546]">El enlace ya fue usado, vencio o no es valido. Pedi una nueva invitacion al Owner.</p><Link href="/login" className="text-sm font-medium text-[#4648d4] underline">Volver al login</Link></div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-[#191c1d] text-balance">
          Crear cuenta
        </h1>
        <p className="text-base leading-6 text-[#4c4546]">
          {validInvite ? `Completa tu alta como ${validInvite.role}.` : "Empezás con un proyecto vacío y una conversación con Co-Build."}
        </p>
      </header>

      <RegisterForm inviteToken={rawInvite} invitedEmail={validInvite?.email} invitedRole={validInvite?.role as "DEV" | "ADMIN" | undefined} />

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
