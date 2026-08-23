import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPostLoginPath } from "@/lib/auth-redirect";

export default async function AuthRedirectPage(props: PageProps<"/auth/redirect">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await props.searchParams;
  redirect(getPostLoginPath(session.user.role, params.callbackUrl));
}
