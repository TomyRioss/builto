import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { filesToRecord, getConversation } from "@/lib/builder/queries";
import { withStarterFiles } from "@/lib/builder/template";
import { BuilderWorkspace } from "@/app/components/builder/BuilderWorkspace";

export default async function BuilderConversationPage(
  props: PageProps<"/dashboard/builder/[conversationId]">,
) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const { conversationId } = await props.params;
  const conversation = await getConversation(conversationId, session.user.id);

  // Tambien cubre "existe pero es de otro": getConversation filtra por dueño.
  if (!conversation?.project) notFound();

  return (
    <BuilderWorkspace
      conversationId={conversation.id}
      projectId={conversation.project.id}
      projectName={conversation.project.name}
      initialMessages={conversation.messages
        .filter((message) => message.senderKind === "USER" || message.senderKind === "AI")
        .map((message) => ({
          id: message.id,
          kind: message.senderKind === "USER" ? ("USER" as const) : ("AI" as const),
          body: message.body,
          images: Array.isArray((message.meta as { images?: string[] } | null)?.images)
            ? (message.meta as { images: string[] }).images
            : undefined,
        }))}
      initialFiles={withStarterFiles(filesToRecord(conversation.project.files))}
    />
  );
}
