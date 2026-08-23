"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { changeStaffRole, createStaffInvite, setStaffActive, type TeamActionState } from "@/app/admin/team/actions";

const initial: TeamActionState = { ok: false, error: null };

export function InviteStaffForm() {
  const [state, action, pending] = useActionState(createStaffInvite, initial);
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (state.error) toast.error(state.error); }, [state.error]);
  async function copy() { if (!state.invitePath) return; await navigator.clipboard.writeText(`${window.location.origin}${state.invitePath}`); setCopied(true); toast.success("Enlace copiado."); }
  return <div><form action={action} className="grid gap-3 md:grid-cols-[1fr_11rem_auto]"><label><span className="sr-only">Email</span><input name="email" type="email" required placeholder="developer@equipo.com" className="h-11 w-full rounded-md border border-[#d9dadb] px-3 text-sm" /></label><label><span className="sr-only">Rol</span><select name="role" className="h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm"><option value="DEV">Developer</option><option value="ADMIN">Administrador</option></select></label><button disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white disabled:opacity-50"><UserPlus className="size-4" />{pending ? "Creando..." : "Crear invitacion"}</button></form>{state.invitePath && <div className="mt-4 flex items-center gap-3 rounded-md border border-[#c9caff] bg-[#eef0ff] p-3"><p className="min-w-0 flex-1 truncate text-sm text-[#3537b7]">{state.invitePath}</p><button type="button" onClick={copy} className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-[#4648d4]" title="Copiar enlace">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}<span className="sr-only">Copiar enlace</span></button></div>}</div>;
}

export function StaffControls({ userId, role, active }: { userId: string; role: string; active: boolean }) {
  const [pending, start] = useTransition();
  return <div className="flex flex-wrap items-center justify-end gap-2"><select aria-label="Rol" defaultValue={role} disabled={pending} onChange={(event) => { const next = event.target.value; start(async () => { const result = await changeStaffRole(userId, next); if (result.ok) toast.success("Rol actualizado."); else toast.error(result.error); }); }} className="h-9 rounded-md border border-[#d9dadb] bg-white px-2 text-sm"><option value="DEV">Developer</option><option value="ADMIN">Administrador</option></select><button type="button" disabled={pending} onClick={() => start(async () => { const result = await setStaffActive(userId, !active); if (result.ok) toast.success(active ? "Acceso desactivado." : "Acceso activado."); else toast.error(result.error); })} className={`min-h-9 rounded-md px-3 text-sm font-medium ${active ? "border border-[#e2b8b8] text-[#a12626] hover:bg-[#fff3f3]" : "bg-black text-white"}`}>{pending ? "Guardando..." : active ? "Desactivar" : "Activar"}</button></div>;
}
