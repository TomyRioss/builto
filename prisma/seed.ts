import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../app/generated/prisma/client";

process.loadEnvFile(".env.local");

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "admin@builto.com";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "admin1234";
const DEV_EMAIL = process.env.SEED_DEV_EMAIL ?? "dev@builto.com";
const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD ?? "BuiltoDev2026!";
const devOnly = process.argv.includes("--dev-only");

async function main() {
  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("[seed] Falta DIRECT_URL en .env.local");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const devPasswordHash = await bcrypt.hash(DEV_PASSWORD, 12);
    let owner = null;

    if (!devOnly) {
      const ownerPasswordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
      owner = await prisma.user.upsert({
        where: { email: OWNER_EMAIL },
        // Re-correr el seed no pisa el nombre: solo reasegura acceso y rol.
        update: { role: "OWNER", passwordHash: ownerPasswordHash, isActive: true },
        create: {
          email: OWNER_EMAIL,
          name: "Owner",
          role: "OWNER",
          passwordHash: ownerPasswordHash,
          emailVerified: new Date(),
        },
        select: { id: true, email: true, role: true },
      });
    }

    const developer = await prisma.user.upsert({
      where: { email: DEV_EMAIL },
      update: { role: "DEV", passwordHash: devPasswordHash, isActive: true },
      create: {
        email: DEV_EMAIL,
        name: "Developer",
        role: "DEV",
        passwordHash: devPasswordHash,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true },
    });

    console.log("[seed] usuarios listos:", devOnly ? { developer } : { owner, developer });
  } catch (error) {
    console.error("[seed] fallo creando el owner", {
      email: OWNER_EMAIL,
      error,
    });
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
