"use client";

import { useEffect, useRef, useState } from "react";
import { LuCode, LuMessageSquare } from "react-icons/lu";

import { ChatPanel } from "./ChatPanel";
import { useBuilderPreview } from "./BuilderPreviewHost";
import { useBuilderStream, type ChatEntry } from "./useBuilderStream";

type Props = {
  conversationId: string;
  projectId: string;
  initialMessages: ChatEntry[];
  initialFiles: Record<string, string>;
};

export function BuilderWorkspace({
  conversationId,
  projectId,
  initialMessages,
  initialFiles,
}: Props) {
  const [mobilePane, setMobilePane] = useState<"chat" | "preview">("chat");
  const previewSlotRef = useRef<HTMLDivElement>(null);

  const { messages, files, streamingProse, writingPath, isStreaming, send } =
    useBuilderStream({ conversationId, initialMessages, initialFiles });

  const setPortalTarget = useBuilderPreview({ projectId, files, writingPath, isStreaming });

  useEffect(() => {
    setPortalTarget(previewSlotRef.current);
    return () => setPortalTarget(null);
  }, [setPortalTarget]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
