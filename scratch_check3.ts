import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

async function main() {
  const p = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  const conv = await p.conversation.findUnique({
    where: { id: "cmt5pzydy0045rwulrax1ni2n" },
    select: { projectId: true },
  });
  const app = await p.projectFile.findUnique({
    where: { projectId_path: { projectId: conv!.projectId, path: "/src/App.tsx" } },
    select: { content: true },
  });
  console.log(app!.content);

  await p.$disconnect();
}

main();
