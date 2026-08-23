"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

const PreviewPanel = dynamic(() => import("@/app/components/builder/PreviewPanel"), {
  ssr: false,
  loading: () => <div className="grid min-h-[560px] place-items-center"><LoaderCircle className="size-5 animate-spin text-[#4648d4]" /></div>,
});

export function ProjectReviewViewer({ projectId, files }: { projectId: string; files: Record<string, string> }) {
  return <div className="flex min-h-[640px] overflow-hidden rounded-lg border border-[#d9dadb]"><PreviewPanel projectId={projectId} files={files} writingPath={null} isStreaming={false} initialTab="preview" readOnly /></div>;
}
