import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DevSidebar } from "@/components/dev/dev-sidebar";
import { isStaff } from "@/lib/permissions";

export const metadata: Metadata = { title: "Developer | Builto", description: "Espacio de trabajo para desarrolladores" };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DV";
}

export default async function DevLayout({ children }: LayoutProps<"/dev">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const name = session.user.name ?? "Developer";
  return <div className="min-h-svh bg-white text-[#191c1d]"><DevSidebar name={name} email={session.user.email ?? ""} initials={initials(name)} /><main className="lg:pl-64">{children}</main></div>;
}
