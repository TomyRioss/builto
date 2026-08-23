import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

async function main() {
  const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  for (const conversationId of ["cmt5pzydy0045rwulrax1ni2n", "cmt5pyia00040rwul4542ths6"]) {
    const conv = await p.conversation.findUnique({
      where: { id: conversationId },
      select: { projectId: true },
    });
    console.log(`\n########## conv ${conversationId} -> project ${conv?.projectId} ##########`);
    if (!conv) continue;

    const files = await p.projectFile.findMany({
      where: { projectId: conv.projectId },
      select: { path: true, content: true },
    });
    console.log("paths saved:", files.map((r) => `${r.path} (${r.content.length})`).join(", "));

    const messages = await p.message.findMany({
      where: { conversationId, senderKind: "AI" },
      orderBy: { createdAt: "desc" },
      take: 1,
      select: { body: true, meta: true, createdAt: true },
    });
    console.log("last AI message meta:", JSON.stringify(messages[0]?.meta));
    console.log("last AI body:", messages[0]?.body);

    const app = files.find((r) => r.path === "/src/App.tsx");
    if (app) {
      console.log("App.tsx tail 400:", app.content.slice(-400));
      // Check for unbalanced braces/tags as a truncation signal
      const opens = (app.content.match(/\{/g) || []).length;
      const closes = (app.content.match(/\}/g) || []).length;
      console.log(`braces open=${opens} close=${closes} diff=${opens - closes}`);
    } else {
      console.log("!!! /src/App.tsx NOT FOUND in ProjectFile !!!");
    }
  }

  await p.$disconnect();
}

main();
