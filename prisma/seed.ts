import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../app/generated/prisma/client";

process.loadEnvFile(".env.local");

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "admin@builto.com";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "admin1234";

async function main() {
  const connectionString = process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("[seed] Falta DIRECT_URL en .env.local");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

    const owner = await prisma.user.upsert({
      where: { email: OWNER_EMAIL },
      // Re-correr el seed no pisa el nombre ni desactiva la cuenta: solo
      // reasegura rol y password.
      update: { role: "OWNER", passwordHash, isActive: true },
      create: {
        email: OWNER_EMAIL,
        name: "Owner",
        role: "OWNER",
        passwordHash,
        emailVerified: new Date(),
      },
      select: { id: true, email: true, role: true },
    });

    console.log("[seed] owner listo:", owner);
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
