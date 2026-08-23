import Image from "next/image";
import Link from "next/link";

import logo from "@/public/logotext.png";

import { auth } from "@/auth";
import { UserMenu } from "./UserMenu";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 flex h-[73px] shrink-0 items-center justify-between border-b border-[#cfc4c5] bg-[#ffffff] px-4 md:px-6">
      <Link href="/dashboard" aria-label="Builto, inicio">
        <Image src={logo} alt="Builto" priority className="h-12 w-auto md:h-14" />
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
