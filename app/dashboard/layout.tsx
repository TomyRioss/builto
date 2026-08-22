import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { currentDashboardUser } from "@/lib/dashboard/current-user";

export const metadata: Metadata = {
  title: "Dashboard | Builto",
  description: "Panel de gestión de Builto",
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="min-h-svh bg-[#f8f9fa] text-[#191c1d]">
      <DashboardSidebar role={currentDashboardUser.role} userName={currentDashboardUser.name} userInitials={currentDashboardUser.initials} />
      <main className="lg:pl-64">
        <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-[96rem] p-4 sm:p-6 lg:min-h-svh lg:p-8 xl:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
