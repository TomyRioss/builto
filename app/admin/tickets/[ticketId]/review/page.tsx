import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminReviewActions } from "@/components/admin/review-actions";
import { ProjectReviewViewer } from "@/components/review/project-review-viewer";
import { filesToRecord } from "@/lib/builder/queries";
import { withStarterFiles } from "@/lib/builder/template";
import { prisma } from "@/lib/prisma";
import { getReviewStage } from "@/lib/tickets/review";

export default async function AdminTicketReviewPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const [ticket, stage] = await Promise.all([
    prisma.ticket.findFirst({ where: { id: ticketId, status: "REVIEW" }, select: { id: true, title: true, project: { select: { id: true, name: true, files: { select: { path: true, content: true } } } } } }),
    getReviewStage(ticketId),
  ]);
  if (!ticket) notFound();
  const files = withStarterFiles(filesToRecord(ticket.project.files));
  return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10"><Link href={`/admin/tickets/${ticketId}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]"><ArrowLeft className="size-4" />Volver al ticket</Link><header className="mt-6 flex flex-col gap-4 border-b border-[#e1e3e4] pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-[#4648d4]">Revision interna · {ticket.project.name}</p><h1 className="mt-2 text-3xl font-semibold">{ticket.title}</h1><p className="mt-2 text-sm text-[#666768]">Revisa el resultado y la estructura de archivos sin modificar el codigo.</p></div>{stage === "ADMIN" ? <div className="w-full max-w-sm"><AdminReviewActions ticketId={ticketId} /></div> : <span className="rounded bg-[#effbf3] px-3 py-2 text-sm font-medium text-[#08783e]">Aprobado internamente · esperando al cliente</span>}</header><div className="mt-7"><ProjectReviewViewer projectId={ticket.project.id} projectName={ticket.project.name} files={files} /></div></div>;
}
