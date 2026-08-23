"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { adminNavigation } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

type Props = { name: string; email: string; role: string };

function Content({ name, email, role, onNavigate }: Props & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navigation = role === "OWNER" ? adminNavigation : adminNavigation.filter((item) => item.href !== "/admin/team");
  return <div className="flex h-full flex-col bg-[#f8f9fa]"><div className="flex h-20 items-center px-7"><Link href="/admin/dashboard" onClick={onNavigate} className="text-xl font-bold uppercase text-black">Builto</Link><span className="ml-3 rounded bg-black px-2 py-1 text-[10px] font-semibold uppercase text-white">{role}</span></div><nav className="flex-1 px-4 py-3" aria-label="Navegacion administrativa"><ul className="space-y-1">{navigation.map((item) => { const Icon = item.icon; const active = pathname.startsWith(item.href); return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-md border-r-2 px-3 py-2.5 text-sm", active ? "border-[#4648d4] bg-[#eef0ff] font-semibold text-[#4648d4]" : "border-transparent text-[#4c4546] hover:bg-[#eceeef]")}><Icon aria-hidden="true" className="size-[1.1rem]" />{item.label}</Link></li>; })}</ul></nav><div className="border-t border-[#e1e3e4] p-6"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-black">{name}</p><p className="mt-1 truncate text-xs text-[#666768]">{email}</p></div><button type="button" onClick={() => signOut({ redirectTo: "/" })} className="grid size-8 shrink-0 place-items-center rounded-md text-[#666768] hover:bg-[#e1e3e4] hover:text-black"><LogOut aria-hidden="true" className="size-4" /><span className="sr-only">Cerrar sesión</span></button></div></div></div>;
}

export function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  return <><aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[#e1e3e4] lg:block"><Content {...props} /></aside><header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e1e3e4] bg-white px-4 lg:hidden"><Link href="/admin/dashboard" className="font-bold uppercase">Builto Admin</Link><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button type="button" className="grid size-10 place-items-center rounded-md border border-[#d9dadb]"><Menu className="size-5" /><span className="sr-only">Abrir menu</span></button></SheetTrigger><SheetContent><div className="sr-only"><SheetTitle>Panel administrativo</SheetTitle><SheetDescription>Navegacion Admin</SheetDescription></div><Content {...props} onNavigate={() => setOpen(false)} /></SheetContent></Sheet></header></>;
}
