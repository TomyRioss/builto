"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuArrowLeft, LuCode, LuMessageSquare } from "react-icons/lu";

import { ChatPanel } from "./ChatPanel";
import { useBuilderPreview } from "./BuilderPreviewHost";
import { useBuilderStream, type ChatEntry } from "./useBuilderStream";

type Props = {
  conversationId: string;
  projectId: string;
  projectName: string;
  initialMessages: ChatEntry[];
  initialFiles: Record<string, string>;
  returnTo?: string | null;
};

export function BuilderWorkspace({
  conversationId,
  projectId,
  projectName,
  initialMessages,
  initialFiles,
  returnTo = null,
}: Props) {
  const [mobilePane, setMobilePane] = useState<"chat" | "preview">("chat");
  const previewSlotRef = useRef<HTMLDivElement>(null);

  const { messages, files, streamingProse, writingPath, isStreaming, isFixing, send } =
    useBuilderStream({ conversationId, initialMessages, initialFiles });

  const setPortalTarget = useBuilderPreview({ projectId, projectName, files, writingPath, isStreaming });

  useEffect(() => {
    setPortalTarget(previewSlotRef.current);
    return () => setPortalTarget(null);
  }, [setPortalTarget]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {returnTo && <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#c9caff] bg-[#fafaff] px-4 py-2.5 md:px-6"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#4648d4]">Ajustando la entrega con IA</p><p className="hidden text-xs text-[#666768] sm:block">Los cambios se aplican al mismo proyecto y el ticket continua en revision.</p></div><Link href={returnTo} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#4648d4] px-4 text-sm font-medium text-white"><LuArrowLeft className="size-4" />Volver a la revision</Link></div>}
      {/* Solo el conmutador de panel, y solo en mobile: en desktop chat y
          preview conviven, no hace falta barra. */}
      <div className="flex items-center justify-center gap-1 border-b border-[#cfc4c5] bg-[#ffffff] px-4 py-2 md:hidden">
        <PaneButton
          active={mobilePane === "chat"}
          onClick={() => setMobilePane("chat")}
          Icon={LuMessageSquare}
          label="Chat"
        />
        <PaneButton
          active={mobilePane === "preview"}
          onClick={() => setMobilePane("preview")}
          Icon={LuCode}
          label="Preview"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className={`flex min-h-0 flex-1 md:flex-none ${
            mobilePane === "chat" ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatPanel
            messages={messages}
            streamingProse={streamingProse}
            isStreaming={isStreaming}
            writingPath={writingPath}
            isFixing={isFixing}
            files={files}
            projectId={projectId}
            projectName={projectName}
            onSend={send}
          />
        </div>

        <div
          ref={previewSlotRef}
          className={`min-h-0 flex-1 ${
            mobilePane === "preview" ? "flex" : "hidden md:flex"
          }`}
        />
      </div>
    </div>
  );
}

function PaneButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex size-9 items-center justify-center rounded ${
        active ? "bg-[#eef2ff] text-[#4648d4]" : "text-[#4c4546] hover:bg-[#edeeef]"
      }`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
