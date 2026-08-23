"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileActionState = { ok: boolean; error: string | null };

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre necesita al menos 2 caracteres.")
    .max(80, "El nombre no puede pasar los 80 caracteres."),
});

export async function updateProfileName(name: string): Promise<ProfileActionState> {
  const session = await auth();

  if (!session?.user?.id) return { ok: false, error: "Inicia sesion de nuevo." };

  const parsed = profileSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    const updated = await prisma.user.updateMany({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    });

    if (updated.count === 0) return { ok: false, error: "No encontramos tu cuenta." };
  } catch (error) {
    console.error("[config] no se pudo actualizar el nombre", {
      userId: session.user.id,
      error,
    });
    return { ok: false, error: "No pudimos guardar tu nombre." };
  }

  await unstable_update({ user: { name: parsed.data.name } });

  revalidatePath("/dashboard/config");
  revalidatePath("/dashboard/account");
  revalidatePath("/dashboard");
  return { ok: true, error: null };
}
