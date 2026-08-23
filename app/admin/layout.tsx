import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { canQuote } from "@/lib/permissions";

export const metadata: Metadata = { title: "Admin | Builto" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canQuote(session.user.role)) redirect(session.user.role === "DEV" ? "/dev/dashboard" : "/dashboard");
  return <div className="min-h-svh bg-white text-[#191c1d]"><AdminSidebar name={session.user.name ?? "Admin"} email={session.user.email ?? ""} role={session.user.role} /><main className="lg:pl-64">{children}</main></div>;
}
