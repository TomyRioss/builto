import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CircleDot, FolderCode } from "lucide-react";

import { auth } from "@/auth";
import { DeveloperWorkspace } from "@/components/dev/workspace/developer-workspace";
import { WorkspaceReviewButton } from "@/components/dev/workspace/workspace-review-button";
import { filesToRecord } from "@/lib/builder/queries";
import { withStarterFiles } from "@/lib/builder/template";
import { getDeveloperWorkspace } from "@/lib/dev/workspace";

type WorkspacePageProps = {
  params: Promise<{ projectId: string; ticketId: string }>;
};

export default async function DeveloperWorkspacePage({ params }: WorkspacePageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId, ticketId } = await params;
  const workspace = await getDeveloperWorkspace(projectId, ticketId, session.user.id);
  if (!workspace) notFound();

  const files = withStarterFiles(filesToRecord(workspace.project.files));

  return (
    <div className="flex h-svh min-h-[640px] flex-col overflow-hidden bg-white">
      <header className="shrink-0 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/dev/projects/${projectId}/tickets/${ticketId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4] hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al ticket
          </Link>
          <span className="hidden h-5 w-px bg-[#d9dadb] sm:block" />
          <p className="inline-flex min-w-0 items-center gap-2 text-sm text-[#666768]">
            <FolderCode aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate font-medium text-black">{workspace.project.name}</span>
          </p>
          <span className="inline-flex items-center gap-2 rounded border border-[#b9e7c8] bg-[#effbf3] px-2 py-1 text-xs font-semibold text-[#08783e]">
            <CircleDot aria-hidden="true" className="size-3.5" />
            En desarrollo
          </span>
          <WorkspaceReviewButton projectId={projectId} ticketId={ticketId} />
        </div>
        <div className="mt-2 flex min-w-0 items-baseline gap-3">
          <h1 className="truncate text-base font-semibold text-black">{workspace.title}</h1>
          <p className="hidden truncate text-xs text-[#777879] md:block">
            {workspace.description}
          </p>
        </div>
      </header>

      <DeveloperWorkspace projectId={workspace.project.id} initialFiles={files} />
    </div>
  );
}
