import { Navbar } from "@/components/landing/navbar";

const secciones = [
  {
    titulo: "1. Uso de la plataforma",
    texto:
      "Builto permite crear, modificar y gestionar sitios web mediante herramientas de inteligencia artificial. Cuando una necesidad requiera conocimientos técnicos adicionales, el usuario podrá solicitar la intervención de un programador a través de la plataforma.",
  },
  {
    titulo: "2. Creación y gestión de proyectos",
    texto:
      "Cada sitio web creado en Builto constituye un proyecto dentro de la plataforma. El usuario podrá utilizar la IA para generar y modificar su sitio, visualizar los cambios y solicitar asistencia humana cuando sea necesario.",
  },
  {
    titulo: "3. Solicitudes a programadores",
    texto:
      "Las solicitudes de trabajo de un programador deberán realizarse mediante el sistema de Tickets de Builto. El usuario deberá proporcionar una descripción clara del problema, cambio o funcionalidad que necesita.",
  },
  {
    titulo: "4. Presupuesto y aprobación",
    texto:
      "Cuando una solicitud requiera intervención humana, Builto podrá evaluar el trabajo y presentar un presupuesto y tiempo estimado de realización. El programador comenzará a trabajar una vez que el usuario haya aceptado la propuesta y, cuando corresponda, realizado el pago.",
  },
  {
    titulo: "5. Alcance de cada solicitud",
    texto:
      "Cada Ticket corresponde a un requerimiento específico. Si durante el desarrollo el usuario solicita modificaciones o funcionalidades adicionales que excedan el alcance acordado, Builto podrá solicitar una nueva cotización o generar un nuevo Ticket.\n\nEsto también aplica si se quiere sumar varias tareas más a un mismo Ticket.",
  },
  {
    titulo: "6. Desarrollo y tiempos de entrega",
    texto:
      "Los tiempos de desarrollo dependerán de la complejidad y alcance de cada solicitud y serán informados al usuario antes de comenzar el trabajo. El estado de cada solicitud podrá consultarse desde la plataforma (Chat o función de seguimiento en tiempo real).",
  },
  {
    titulo: "7. Cambios y revisión",
    texto:
      "Una vez finalizado el trabajo, el usuario podrá revisar los cambios realizados por el programador directamente sobre su proyecto. En caso de que el resultado no corresponda con el requerimiento aprobado, podrá solicitar las correcciones correspondientes según las condiciones del trabajo contratado.",
  },
  {
    titulo: "8. Uso de inteligencia artificial y programadores",
    texto:
      "Builto combina herramientas de inteligencia artificial con intervención humana. La IA podrá encargarse de generar y modificar diferentes partes del sitio, mientras que los programadores podrán intervenir cuando una tarea requiera desarrollo especializado solicitado, correcciones complejas o funcionalidades que la IA o persona no pueda resolver adecuadamente.",
  },
  {
    titulo: "9. Propiedad y derechos sobre el proyecto",
    texto:
      "La titularidad y los derechos sobre los sitios web, código, diseños y contenidos creados mediante Builto dependerán de la forma en que hayan sido generados y de los acuerdos establecidos entre las partes.\n\nContenido generado mediante inteligencia artificial: los resultados producidos exclusivamente por IA pueden no estar protegidos por derechos de autor cuando no existe una intervención creativa humana. Builto podrá otorgar al usuario los derechos de uso comercial que correspondan sobre los resultados generados mediante la plataforma, de acuerdo con sus condiciones de servicio y las herramientas de IA utilizadas.\n\nContenido desarrollado por programadores humanos: cuando un programador intervenga en un proyecto, los derechos sobre el código, diseño u otros elementos creados estarán sujetos a las condiciones acordadas para esa tarea y proyecto. Cuando corresponda, Builto podrá transferir al usuario los derechos patrimoniales sobre el trabajo contratado, manteniéndose aquellos derechos que legalmente no puedan ser transferidos.\n\nEl usuario será responsable de contar con los derechos, licencias o autorizaciones necesarias sobre cualquier contenido, imagen, texto, código, marca o recurso de terceros que incorpore a su proyecto.\n\nBuilto no garantiza que los resultados generados mediante IA sean exclusivos ni que se encuentren libres de derechos de terceros. Asimismo, los derechos sobre herramientas, modelos de IA, librerías, recursos de terceros y tecnologías utilizadas para desarrollar el proyecto permanecerán sujetos a sus respectivas licencias y condiciones de uso.",
  },
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
          Términos y condiciones de Builto
        </h1>
        <div className="mt-16 flex flex-col gap-16">
          {secciones.map((s) => (
            <section key={s.titulo}>
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-black">
                {s.titulo}
              </h2>
              <p className="mt-4 max-w-[70ch] whitespace-pre-line text-base font-normal leading-relaxed text-[#4c4546]">
                {s.texto}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
