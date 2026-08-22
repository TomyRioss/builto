"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getNavigationForRole, roleLabels, type DashboardRole } from "@/lib/dashboard/navigation";

type DashboardSidebarProps = {
  role: DashboardRole;
  userName: string;
  userInitials: string;
};

function SidebarContent({ role, userName, userInitials, onNavigate }: DashboardSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center border-b border-[#e1e3e4] px-6">
        <Link href="/dashboard" onClick={onNavigate} className="text-xl font-bold tracking-[-0.04em] text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4648d4]">
          Builto
        </Link>
      </div>

      <nav aria-label="Navegación del dashboard" className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8a8b8c]">Espacio de trabajo</p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]",
                    isActive ? "bg-[#eef0ff] text-[#4648d4]" : "text-[#4c4546] hover:bg-[#f3f4f5] hover:text-black",
                  )}
                >
                  <Icon aria-hidden="true" className="size-[1.1rem] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#e1e3e4] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-[#f8f9fa] p-3">
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#191c1d] text-xs font-semibold text-white">{userInitials}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-black">{userName}</p>
            <p className="truncate text-xs text-[#666768]">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e1e3e4] bg-white lg:block">
        <SidebarContent {...props} />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e1e3e4] bg-white/95 px-4 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button type="button" className="grid size-10 place-items-center rounded-md border border-[#d9dadb] text-black transition-colors hover:bg-[#f3f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </button>
          </SheetTrigger>
          <SheetContent>
            <div className="sr-only">
              <SheetTitle>Menú del dashboard</SheetTitle>
              <SheetDescription>Navegación principal de Builto</SheetDescription>
            </div>
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="text-lg font-bold tracking-[-0.04em] text-black">Builto</Link>
        <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-[#191c1d] text-xs font-semibold text-white">{props.userInitials}</span>
      </header>
    </>
  );
}
