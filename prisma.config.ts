import { defineConfig, env } from "prisma/config";

// ponytail: Prisma CLI does not read .env.local on its own
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
