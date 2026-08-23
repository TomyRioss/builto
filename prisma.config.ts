import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// ponytail: Prisma CLI does not read .env.local on its own. Solo existe en
// local (gitignored); en Vercel las env vars ya vienen inyectadas.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
