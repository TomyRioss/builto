import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { listConversations } from "@/lib/builder/queries";
import { BuilderSidebar } from "../../components/BuilderSidebar";
import { BuilderSandbox } from "@/app/components/builder/BuilderSandbox";

export default async function BuilderLayout(props: LayoutProps<"/dashboard/builder">) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const conversations = await listConversations(session.user.id);

  return (
    <>
      <BuilderSidebar
        conversations={conversations.map((conversation) => ({
          id: conversation.id,
          projectId: conversation.project?.id ?? null,
          name: conversation.project?.name ?? "Sitio nuevo",
          updatedAt: conversation.updatedAt.toISOString(),
        }))}
      />
      <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <BuilderSandbox>{props.children}</BuilderSandbox>
      </main>
    </>
  );
}
