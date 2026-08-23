import { Navbar } from "../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout(props: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f8f9fa] text-[#191c1d]">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">{props.children}</div>
      <Toaster position="bottom-right" />
    </div>
  );
}
