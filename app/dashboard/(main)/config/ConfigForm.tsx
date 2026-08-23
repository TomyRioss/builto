"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateProfileName } from "./actions";

type Preferences = {
  aiMessages: boolean;
  ticketUpdates: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  aiMessages: true,
  ticketUpdates: true,
};

export function ConfigForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isPending, startTransition] = useTransition();

  function updatePreference<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const result = await updateProfileName(name);
      if (!result.ok) {
        toast.error(result.error ?? "No pudimos guardar los cambios.");
        return;
      }
      setSavedName(name.trim());
      setName(name.trim());
      toast.success("Cambios guardados.");
    });
  }

  function cancel() {
    setName(savedName);
    setPreferences(DEFAULT_PREFERENCES);
    toast.message("Cambios descartados.");
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#cfc4c5] bg-[#ffffff] px-5 py-4 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.4)] md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#191c1d] text-sm font-semibold text-white">
            {(name.trim() || email).slice(0, 1).toUpperCase() || "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#191c1d]">{name.trim() || "Tu cuenta"}</p>
            <p className="truncate text-xs text-[#4c4546]">{email}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#ecf9f1] px-2.5 py-1 text-xs font-medium text-[#187342]">Cuenta activa</span>
      </div>

      <ConfigSection title="Cuenta">
        <ConfigRow label="Nombre" hint="Como te ven en Builto">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className="w-full rounded-md border border-[#cfc4c5] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none focus:border-[#4648d4] md:w-64"
          />
        </ConfigRow>
        <ConfigRow label="Email" hint="Usado para iniciar sesión">
          <input
            type="email"
            value={email}
            readOnly
            aria-describedby="email-help"
            className="w-full cursor-not-allowed rounded-md border border-[#cfc4c5] bg-[#f3f4f5] px-3 py-2 text-sm leading-5 text-[#4c4546] outline-none md:w-64"
          />
          <span id="email-help" className="sr-only">El email se cambia desde el proveedor de inicio de sesión.</span>
        </ConfigRow>
        <ConfigRow label="Idioma" hint="Idioma de la interfaz">
          <select className="w-full rounded-md border border-[#cfc4c5] bg-[#ffffff] px-3 py-2 text-sm leading-5 outline-none focus:border-[#4648d4] md:w-64" defaultValue="Español">
            <option>Español</option>
          </select>
        </ConfigRow>
      </ConfigSection>

      <ConfigSection title="Notificaciones">
        <ToggleRow label="Mensajes de la IA" hint="Aviso cuando la IA actualiza tu sitio" checked={preferences.aiMessages} onChange={(value) => updatePreference("aiMessages", value)} />
        <ToggleRow label="Actualizaciones de tickets" hint="Aviso cuando cambia el estado de un ticket" checked={preferences.ticketUpdates} onChange={(value) => updatePreference("ticketUpdates", value)} />
      </ConfigSection>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={save} disabled={isPending || name.trim() === savedName} className="inline-flex items-center justify-center rounded-md bg-[#000000] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" onClick={cancel} disabled={isPending} className="inline-flex items-center justify-center rounded-md border border-[#cfc4c5] bg-[#ffffff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:bg-[#edeeef] hover:text-[#191c1d] disabled:opacity-50">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-[#7e7576]">{title}</h2>
      <div className="mt-3 divide-y divide-[#e1e3e4] overflow-hidden rounded-xl border border-[#cfc4c5] bg-[#ffffff] shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]">{children}</div>
    </section>
  );
}

function ConfigRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-5 transition-colors hover:bg-[#fafafa] md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
      <div className="min-w-0"><p className="text-sm font-medium leading-5">{label}</p><p className="mt-1 text-sm leading-5 text-[#4c4546]">{hint}</p></div>
      <div className="flex w-full flex-col gap-1 md:w-auto">{children}</div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-5 md:px-6">
      <div><p className="text-sm font-medium leading-5">{label}</p><p className="mt-1 text-sm leading-5 text-[#4c4546]">{hint}</p></div>
      <label className="inline-flex shrink-0 cursor-pointer items-center rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#4648d4]">
        <span className="sr-only">{label}</span>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="relative h-6 w-11 rounded-full bg-[#cfc4c5] transition-colors peer-checked:bg-[#000000] after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-[#ffffff] after:transition-transform peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}
