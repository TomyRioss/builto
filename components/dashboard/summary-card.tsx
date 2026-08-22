import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type SummaryCardProps = {
  label: string;
  value: number;
  helper: string;
  href: string;
  icon: LucideIcon;
  accent?: "indigo" | "amber" | "emerald" | "slate";
};

const accents = {
  indigo: "bg-[#eef0ff] text-[#4648d4]",
  amber: "bg-[#fff8e7] text-[#8a5a00]",
  emerald: "bg-[#ecf9f1] text-[#187342]",
  slate: "bg-[#f3f4f5] text-[#4c4546]",
};

export function SummaryCard({ label, value, helper, href, icon: Icon, accent = "slate" }: SummaryCardProps) {
  return (
    <Card className="group transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#c7c8c9] hover:shadow-[0_16px_32px_-22px_rgba(15,23,42,0.4)]">
      <CardContent className="p-5 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-10 place-items-center rounded-lg ${accents[accent]}`}>
            <Icon aria-hidden="true" className="size-[1.1rem]" />
          </span>
          <Link href={href} aria-label={`Ver ${label.toLowerCase()}`} className="grid size-9 place-items-center rounded-md text-[#8a8b8c] transition-colors hover:bg-[#f3f4f5] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4648d4]">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <p className="mt-6 text-3xl font-semibold tracking-[-0.045em] text-black">{value}</p>
        <p className="mt-1 text-sm font-medium text-[#353839]">{label}</p>
        <p className="mt-2 text-xs leading-5 text-[#777879]">{helper}</p>
      </CardContent>
    </Card>
  );
}
