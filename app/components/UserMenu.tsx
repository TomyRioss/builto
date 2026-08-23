"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  email: string;
  name: string | null;
  image: string | null;
};

export function UserMenu({ email, name, image }: UserMenuProps) {
  async function handleSignOut() {
    try {
      await signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("[user-menu] fallo el cierre de sesion", { email, error });
      window.alert("No pudimos cerrar la sesion. Intenta de nuevo.");
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group flex items-center gap-3 rounded-none px-2 py-1.5 text-left transition-colors hover:bg-[#f1f2f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#191c1d]">
        <Avatar className="size-8 rounded-none">
          {image ? <AvatarImage className="rounded-none" src={image} alt={name ?? email} /> : null}
          <AvatarFallback className="rounded-none bg-[#e1e3e4] text-[#4c4546]">
            <User aria-hidden="true" className="size-4" />
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[200px] truncate text-sm font-normal text-[#4c4546] sm:block">
          {email}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-[#4c4546] transition-transform duration-200 group-aria-expanded:rotate-180"
        />
        <span className="sr-only">Abrir menu de usuario</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-0 rounded-none">
        <DropdownMenuItem
          render={<Link href="/dashboard/account" />}
          className="rounded-none px-3 py-2"
        >
          <User aria-hidden="true" />
          Cuenta
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/dashboard/config" />}
          className="rounded-none px-3 py-2"
        >
          <Settings aria-hidden="true" />
          Configuracion
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-none px-3 py-2"
          onClick={handleSignOut}
        >
          <LogOut aria-hidden="true" />
          Cerrar Sesion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
