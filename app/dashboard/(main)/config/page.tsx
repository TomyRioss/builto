import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ConfigForm } from "./ConfigForm";

export default async function ConfigPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">
      <div className="border-b border-[#cfc4c5] pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7e7576]">Preferencias</p>
          <h1 className="mt-1 text-2xl font-semibold leading-8 tracking-[-0.02em] text-[#191c1d] md:text-[32px] md:leading-10">Configuración</h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-5 text-[#4c4546]">Personalizá tu cuenta y la forma en que trabajás con Builto.</p>
        </div>
      </div>
      <ConfigForm initialName={session.user.name ?? ""} email={session.user.email ?? ""} />
    </div>
  );
}
