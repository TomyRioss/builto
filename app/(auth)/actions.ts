"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/enums";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Poné al menos 2 caracteres."),
  email: z.email("Revisá el email, no tiene formato válido."),
  password: z.string().min(8, "La contraseña necesita 8 caracteres o más."),
  inviteToken: z.string().optional(),
});

export type RegisterState = { error: string | null; role?: Role };

export async function registerUser(input: unknown): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, password, inviteToken } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const role = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) throw new Error("USER_EXISTS");
      let invitedRole: "DEV" | "ADMIN" | null = null;
      let inviteId: string | null = null;
      if (inviteToken) {
        const invite = await tx.invite.findUnique({ where: { token: createHash("sha256").update(inviteToken).digest("hex") } });
        if (!invite || invite.acceptedAt || invite.expiresAt <= new Date() || invite.email.toLowerCase() !== email || (invite.role !== "DEV" && invite.role !== "ADMIN")) throw new Error("INVALID_INVITE");
        invitedRole = invite.role;
        inviteId = invite.id;
      }
      const user = await tx.user.create({ data: { name, email, passwordHash, role: invitedRole ?? "USER", emailVerified: invitedRole ? new Date() : null } });
      if (inviteId) {
        await tx.invite.update({ where: { id: inviteId }, data: { acceptedAt: new Date() } });
        await tx.auditLog.create({ data: { actorId: user.id, action: "staff.invite_accepted", entityType: "User", entityId: user.id, meta: { role: invitedRole } } });
      }
      return user.role;
    });

    return { error: null, role };
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") return { error: "Ese email ya tiene una cuenta. Iniciá sesión." };
    if (error instanceof Error && error.message === "INVALID_INVITE") return { error: "La invitacion no es valida o ya vencio." };
    console.error("[auth] fallo el alta de usuario", { email, error });
    return { error: "No pudimos crear la cuenta. Probá de nuevo." };
  }
}
