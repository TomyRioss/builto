import type { Metadata } from "next";
import { ClientSidebar } from "@/components/client-dashboard/client-sidebar";

export const metadata: Metadata = {
  title: "Mi espacio | Builto",
  description: "Panel de proyectos del cliente",
};

export default function ClientLayout({ children }: LayoutProps<"/client">) {
  return (
    <div className="min-h-svh bg-white text-[#191c1d]">
      <ClientSidebar name="Nahuel Brandalise" email="nahuel@workspace.ar" initials="NB" />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
