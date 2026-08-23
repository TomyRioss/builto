import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/enums";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials exige JWT: el adapter sigue usandose para linkear cuentas OAuth.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);

        if (!parsed.success) {
          console.warn("[auth] credenciales con formato invalido", {
            email: typeof raw?.email === "string" ? raw.email : null,
            issues: parsed.error.issues.map((i) => i.path.join(".")),
          });
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const user = await prisma.user.findUnique({ where: { email } });

          // Mismo return para "no existe", "es cuenta OAuth" y "password mal":
          // no filtrar que emails estan registrados.
          if (!user?.passwordHash || !user.isActive) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error("[auth] fallo el login por credenciales", {
            email,
            error,
          });
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Login: viene el user del provider.
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role ?? "USER";
        token.isActive = (user as { isActive?: boolean }).isActive ?? true;
      }

      // Releer siempre mantiene cambios de rol y desactivaciones efectivos aun
      // cuando el usuario ya tenia un JWT abierto.
      if (trigger === "update" || token.id || token.sub) {
        try {
          const db = await prisma.user.findUnique({
            where: { id: token.id ?? (token.sub as string) },
            select: { id: true, role: true, isActive: true },
          });

          if (db) {
            token.id = db.id;
            token.role = db.role;
            token.isActive = db.isActive;
          }
        } catch (error) {
          console.error("[auth] no se pudo refrescar el rol del token", {
            userId: token.id ?? token.sub,
            error,
          });
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? (token.sub as string);
        session.user.role = token.role ?? "USER";
        session.user.isActive = token.isActive !== false;
      }
      return session;
    },
  },
});
