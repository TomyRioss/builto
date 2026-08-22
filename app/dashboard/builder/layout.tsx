import { BuilderSidebar } from "../../components/BuilderSidebar";

export default function BuilderLayout(props: LayoutProps<"/dashboard/builder">) {
  return (
    <>
      <BuilderSidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{props.children}</main>
    </>
  );
}
