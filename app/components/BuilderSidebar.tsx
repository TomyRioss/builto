"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LuArrowLeft,
  LuChevronLeft,
  LuChevronRight,
  LuMessageSquare,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { toast } from "sonner";

import { isRedirect } from "@/lib/is-redirect";

import { createConversation, deleteConversation } from "@/app/dashboard/builder/actions";

export type SidebarConversation = {
  id: string;
  projectId: string | null;
  name: string;
  updatedAt: string;
};

export function BuilderSidebar({
  conversations,
}: {
  conversations: SidebarConversation[];
}) {
  const params = useParams<{ conversationId?: string }>();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(conversation: SidebarConversation) {
    if (!conversation.projectId) return;

    setDeletingId(conversation.id);
    startTransition(async () => {
      try {
        const result = await deleteConversation(conversation.projectId!);
        if (!result.ok) {
          toast.error(result.error ?? "No pudimos borrar el chat.");
        } else {
          toast.success("Chat borrado.");
          if (params?.conversationId === conversation.id) router.push("/dashboard/builder");
        }
      } catch (error) {
        console.error("[builder] fallo borrar la conversacion", { error });
        toast.error("No pudimos borrar el chat.");
      } finally {
        setDeletingId(null);
        setConfirmingId(null);
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      try {
        const result = await createConversation();
        // Con exito la action redirige y esto no se alcanza.
        if (result && !result.ok) toast.error(result.error ?? "No pudimos crear el proyecto.");
      } catch (error) {
        // NEXT_REDIRECT viaja como excepcion: no es un fallo.
        if (isRedirect(error)) return;
        console.error("[builder] fallo crear conversacion", { error });
        toast.error("No pudimos crear el proyecto.");
      }
    });
  }

  return (
    <aside
      className={`relative flex w-full shrink-0 flex-col border-b border-[#cfc4c5] bg-[#ffffff] transition-[width] duration-200 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] md:self-start md:border-b-0 md:border-r ${
        collapsed ? "md:w-16" : "md:w-60"
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b border-[#cfc4c5] py-5 ${
          collapsed ? "md:justify-center md:px-0" : "justify-between px-6"
        }`}
      >
        <Link
          href="/dashboard"
          title="Volver al panel"
          className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:text-[#191c1d] ${
            collapsed ? "md:hidden" : ""
          }`}
        >
          <LuArrowLeft className="size-4" aria-hidden />
          Chats
        </Link>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          aria-label="Nuevo chat"
          title="Nuevo chat"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#000000] text-[#ffffff] transition-all hover:scale-105 hover:bg-[#4648d4] disabled:opacity-50"
        >
          <LuPlus className="size-4" aria-hidden />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {conversations.length === 0 ? (
          <p
            className={`px-6 py-5 text-sm leading-5 text-[#7e7576] ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            Todavia no tenes proyectos.
          </p>
        ) : (
          <ul className="divide-y divide-[#cfc4c5] border-b border-[#cfc4c5]">
            {conversations.map((conversation) => {
              const active = params?.conversationId === conversation.id;
              const confirming = confirmingId === conversation.id;
              const deleting = deletingId === conversation.id;

              return (
                <li key={conversation.id} className="group relative">
                  <Link
                    href={`/dashboard/builder/${conversation.id}`}
                    aria-current={active ? "page" : undefined}
                    title={conversation.name}
                    className={`flex items-center gap-3 py-5 text-left ${
                      collapsed
                        ? "md:justify-center md:px-0"
                        : conversation.projectId
                          ? "py-5 pl-6 pr-14"
                          : "px-6"
                    } ${active ? "border-l-[3px] border-l-[#4648d4] bg-[#edeeef]" : "border-l-[3px] border-l-transparent hover:bg-[#f3f4f5]"}`}
                  >
                    <LuMessageSquare
                      className={`size-4 shrink-0 ${
                        active ? "text-[#4648d4]" : "text-[#7e7576]"
                      } ${collapsed ? "hidden md:block" : "hidden"}`}
                      aria-hidden
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-sm leading-5 text-[#191c1d] ${
                        collapsed ? "md:hidden" : ""
                      }`}
                    >
                      {conversation.name}
                    </span>
                    {confirming ? null : (
                      <span
                        suppressHydrationWarning
                        className={`inline-flex shrink-0 items-center gap-1.5 text-xs text-[#7e7576] ${
                          collapsed ? "md:hidden" : ""
                        }`}
                      >
                        {isNow(conversation.updatedAt) && (
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4648d4] opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-[#4648d4]" />
                          </span>
                        )}
                        {relativeTimeLabel(conversation.updatedAt)}
                      </span>
                    )}
                  </Link>

                  {!collapsed && conversation.projectId && (
                    <div
                      className={`absolute inset-y-0 right-3 flex items-center gap-2 ${
                        confirming ? "bg-white pl-2" : ""
                      }`}
                    >
                      {confirming ? (
                        <>
                          <span className="text-xs font-medium leading-4 text-[#4c4546]">
                            ¿Borrar?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(conversation)}
                            disabled={deleting}
                            className="rounded-md bg-[#ba1a1a] px-2 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#ffffff] hover:bg-[#93000a] disabled:opacity-60"
                          >
                            {deleting ? "..." : "Si"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={deleting}
                            className="rounded-md border border-[#cfc4c5] px-2 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#4c4546] hover:bg-[#f3f4f5]"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingId(conversation.id)}
                          aria-label={`Borrar ${conversation.name}`}
                          title="Borrar chat"
                          className="inline-flex size-8 items-center justify-center rounded-md border border-[#cfc4c5] bg-[#ffffff] text-[#4c4546] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                        >
                          <LuTrash2 className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir chats" : "Colapsar chats"}
        title={collapsed ? "Expandir chats" : "Colapsar chats"}
        className="absolute -right-3 top-4 z-10 hidden size-6 items-center justify-center rounded border border-[#cfc4c5] bg-[#ffffff] text-[#4c4546] hover:border-[#191c1d] hover:text-[#191c1d] md:flex"
      >
        {collapsed ? (
          <LuChevronRight className="size-3.5" aria-hidden />
        ) : (
          <LuChevronLeft className="size-3.5" aria-hidden />
        )}
      </button>
    </aside>
  );
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["week", 604_800_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto", style: "narrow" });

function isNow(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < UNITS[UNITS.length - 1][1];
}

function relativeTimeLabel(iso: string): string {
  const elapsed = Date.now() - new Date(iso).getTime();

  for (const [unit, ms] of UNITS) {
    if (elapsed >= ms) return formatter.format(-Math.floor(elapsed / ms), unit);
  }

  return "editado ahora";
}
