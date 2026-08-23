"use client";

import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";

export function SignOutButton() {
  async function handleSignOut() {
    try {
      await signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("[account] fallo el cierre de sesion", { error });
      window.alert("No pudimos cerrar la sesion. Intenta de nuevo.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-md border border-[#cfc4c5] bg-[#ffffff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d]"
    >
      <LuLogOut className="size-4" aria-hidden />
      Cerrar sesión
    </button>
  );
}
