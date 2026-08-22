"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Poné al menos 2 caracteres."),
  email: z.email("Revisá el email, no tiene formato válido."),
  password: z.string().min(8, "La contraseña necesita 8 caracteres o más."),
});

export type RegisterState = { error: string | null };

export async function registerUser(input: unknown): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return { error: "Ese email ya tiene una cuenta. Iniciá sesión." };
    }

    await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    });

    return { error: null };
  } catch (error) {
    console.error("[auth] fallo el alta de usuario", { email, error });
    return { error: "No pudimos crear la cuenta. Probá de nuevo." };
  }
}
