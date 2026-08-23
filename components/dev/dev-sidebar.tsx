"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { devNavigation } from "@/lib/dev/navigation";
import { cn } from "@/lib/utils";

type DevSidebarProps = {
  name: string;
  email: string;
  initials: string;
};

function SidebarContent({ name, email, initials, onNavigate }: DevSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#f8f9fa]">
      <div className="flex h-20 items-center px-7">
        <Link href="/dev/dashboard" onClick={onNavigate} className="text-xl font-bold uppercase text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4648d4]">Builto</Link>
      </div>

      <nav aria-label="Navegacion del desarrollador" className="flex-1 overflow-y-auto px-4 py-3">
        <ul className="space-y-1">
          {devNavigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dev/projects" ? pathname.startsWith(item.href) : pathname === item.href;
            return (
              <li key={item.label}>
                <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md border-r-2 px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]", active ? "border-[#4648d4] bg-[#f3f4f5] font-semibold text-[#4648d4]" : "border-transparent text-[#4c4546] hover:bg-[#f3f4f5] hover:text-black")}>
                  <Icon aria-hidden="true" className="size-[1.1rem] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#e1e3e4] p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e1e3e4] text-[0.68rem] font-semibold text-black">{initials}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-black">{name}</p><p className="truncate text-xs text-[#666768]">{email}</p></div>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            className="grid size-8 shrink-0 place-items-center rounded-md text-[#666768] hover:bg-[#e1e3e4] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"
          >
            <LogOut aria-hidden="true" className="size-4" />
            <span className="sr-only">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DevSidebar(props: DevSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e1e3e4] lg:block"><SidebarContent {...props} /></aside>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e1e3e4] bg-white/95 px-4 backdrop-blur-sm lg:hidden">
        <Link href="/dev/dashboard" className="text-lg font-bold uppercase text-black">Builto</Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><button type="button" className="grid size-10 place-items-center rounded-md border border-[#d9dadb] text-black hover:bg-[#f3f4f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]"><Menu aria-hidden="true" className="size-5" /><span className="sr-only">Abrir menu</span></button></SheetTrigger>
          <SheetContent><div className="sr-only"><SheetTitle>Menu del desarrollador</SheetTitle><SheetDescription>Navegacion del espacio de desarrollo</SheetDescription></div><SidebarContent {...props} onNavigate={() => setOpen(false)} /></SheetContent>
        </Sheet>
      </header>
    </>
  );
}
