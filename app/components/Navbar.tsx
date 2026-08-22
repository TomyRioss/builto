import Link from "next/link";

export function Navbar() {
  return (
    <header className="flex h-[73px] shrink-0 items-center border-b border-[#cfc4c5] bg-[#ffffff] px-4 md:px-6">
      <Link
        href="/dashboard"
        className="text-3xl font-semibold uppercase tracking-[0.35em] md:text-4xl md:tracking-[0.45em] text-[#191c1d]"
      >
        Builto
      </Link>
    </header>
  );
}
