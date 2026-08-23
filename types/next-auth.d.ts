import type { DefaultSession } from "next-auth";
import type { Role } from "@/app/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    isActive?: boolean;
  }
}

// En Auth.js v5 el JWT vive en @auth/core/jwt; augmentar "next-auth/jwt" no
// aplica el merge.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    isActive?: boolean;
  }
}
