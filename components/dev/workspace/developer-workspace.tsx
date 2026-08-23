"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

const PreviewPanel = dynamic(
  () => import("@/app/components/builder/PreviewPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-0 flex-1 place-items-center bg-[#f8f9fa] text-sm text-[#666768]">
        <span className="flex items-center gap-2">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          Preparando workspace...
        </span>
      </div>
    ),
  },
);

type Props = {
  projectId: string;
  initialFiles: Record<string, string>;
};

export function DeveloperWorkspace({ projectId, initialFiles }: Props) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden border-t border-[#d9dadb]">
      <PreviewPanel
        projectId={projectId}
        files={initialFiles}
        writingPath={null}
        isStreaming={false}
        initialTab="code"
        allowImport
      />
    </div>
  );
}
