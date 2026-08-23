import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

import { auth } from "@/auth";
import { ClientReviewActions } from "@/app/components/tickets/ClientReviewActions";
import { ProjectReviewViewer } from "@/components/review/project-review-viewer";
import { filesToRecord } from "@/lib/builder/queries";
import { withStarterFiles } from "@/lib/builder/template";
import { prisma } from "@/lib/prisma";
import { getReviewStage } from "@/lib/tickets/review";

export default async function ClientTicketReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const [ticket, stage] = await Promise.all([
    prisma.ticket.findFirst({ where: { id, createdById: session.user.id, status: "REVIEW" }, select: { id: true, title: true, project: { select: { id: true, name: true, files: { select: { path: true, content: true } } } } } }),
    getReviewStage(id),
  ]);
  if (!ticket || stage !== "CLIENT") notFound();
  const files = withStarterFiles(filesToRecord(ticket.project.files));
  return <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-10"><Link href={`/dashboard/tickets/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#4648d4]"><LuArrowLeft className="size-4" />Volver al ticket</Link><header className="mt-6 grid gap-5 border-b border-[#e1e3e4] pb-6 lg:grid-cols-[1fr_28rem]"><div><p className="text-sm font-medium text-[#4648d4]">Revision de entrega · {ticket.project.name}</p><h1 className="mt-2 text-3xl font-semibold">{ticket.title}</h1><p className="mt-2 text-sm text-[#666768]">Navega el resultado y revisa los archivos en modo solo lectura.</p></div><ClientReviewActions ticketId={id} /></header><div className="mt-7"><ProjectReviewViewer projectId={ticket.project.id} files={files} /></div></div>;
}
