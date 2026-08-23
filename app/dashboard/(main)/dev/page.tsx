import { redirect } from "next/navigation";

export default function LegacyDevDashboardPage() {
  redirect("/dev/dashboard");
}
