import { MainSidebar } from "../../components/MainSidebar";

export default function MainLayout(props: LayoutProps<"/dashboard">) {
  return (
    <>
      <MainSidebar />
      <main className="flex min-w-0 flex-1 flex-col">{props.children}</main>
    </>
  );
}
