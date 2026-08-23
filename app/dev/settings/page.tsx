import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DeveloperSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header><p className="text-sm font-medium text-[#4648d4]">Espacio Developer</p><h1 className="mt-2 text-3xl font-semibold leading-tight text-black sm:text-4xl">Settings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c4546] sm:text-base">Informacion de tu cuenta Developer.</p></header>
      <section className="mt-8 border-y border-[#e1e3e4] bg-white"><div className="grid gap-2 border-b border-[#eceeef] px-4 py-5 sm:grid-cols-[12rem_1fr] sm:px-6"><p className="text-sm font-medium text-black">Nombre</p><p className="text-sm text-[#666768]">{session.user.name ?? "Developer"}</p></div><div className="grid gap-2 border-b border-[#eceeef] px-4 py-5 sm:grid-cols-[12rem_1fr] sm:px-6"><p className="text-sm font-medium text-black">Email</p><p className="break-all text-sm text-[#666768]">{session.user.email ?? "Sin email"}</p></div><div className="grid gap-2 px-4 py-5 sm:grid-cols-[12rem_1fr] sm:px-6"><p className="text-sm font-medium text-black">Rol</p><p className="text-sm text-[#666768]">Developer</p></div></section>
    </div>
  );
}
