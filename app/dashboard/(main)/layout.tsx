import { MainSidebar } from "../../components/MainSidebar";

export default function MainLayout(props: LayoutProps<"/dashboard">) {
  return (
    <>
      <MainSidebar />
      {/* El body tiene overflow-hidden porque el builder necesita paneles fijos:
          el scroll de las paginas normales vive aca. min-h-0 es lo que deja al
          hijo flex encogerse por debajo de su contenido y scrollear. */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">{props.children}</main>
    </>
  );
}
