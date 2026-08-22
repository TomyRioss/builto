import Link from "next/link";

import { auth } from "@/auth";
import { UserMenu } from "./UserMenu";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-[#cfc4c5] bg-[#ffffff] px-4 md:px-6">
      <Link
        href="/dashboard"
        className="text-3xl font-semibold uppercase tracking-[0.35em] md:text-4xl md:tracking-[0.45em] text-[#191c1d]"
      >
        Builto
      </Link>
      {user?.email ? (
        <UserMenu
          email={user.email}
          name={user.name ?? null}
          image={user.image ?? null}
        />
      ) : null}
    </header>
  );
}
