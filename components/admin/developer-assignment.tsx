"use client";

import { useState, useTransition } from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { assignDeveloper } from "@/app/admin/tickets/actions";

type Developer = { id: string; name: string | null; email: string; _count: { ticketsAssigned: number } };

export function DeveloperAssignment({ ticketId, developers, currentDeveloperId }: { ticketId: string; developers: Developer[]; currentDeveloperId: string | null }) {
  const [developerId, setDeveloperId] = useState(currentDeveloperId ?? "");
  const [pending, start] = useTransition();
  return <div><label className="text-sm font-medium">Developer<select value={developerId} onChange={(event) => setDeveloperId(event.target.value)} disabled={pending} className="mt-2 h-11 w-full rounded-md border border-[#d9dadb] bg-white px-3 text-sm font-normal"><option value="">Seleccionar Developer</option>{developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name ?? developer.email} · {developer._count.ticketsAssigned} activos</option>)}</select></label><button type="button" disabled={pending || !developerId || developerId === currentDeveloperId} onClick={() => start(async () => { const result = await assignDeveloper(ticketId, developerId); if (result.ok) toast.success("Developer asignado."); else toast.error(result.error); })} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white disabled:opacity-40"><UserCheck className="size-4" />{pending ? "Asignando..." : currentDeveloperId ? "Cambiar asignacion" : "Asignar Developer"}</button></div>;
}
