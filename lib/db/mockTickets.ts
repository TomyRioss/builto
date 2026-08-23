import { Ticket } from "../../types/tikets";

// Mock — reemplazar por fetch a Supabase (tabla `tickets`) cuando esté disponible.
export const MOCK_TICKETS: Ticket[] = [
  { id: 112, fecha: "2023-10-24", asunto: "Optimización de Carga", descripcion: "Mejorar el LCP en la página principal para cumplir Core Web Vitals.", estado: "en_progreso" },
  { id: 110, fecha: "2023-10-22", asunto: "Nueva Sección de Testimonios", descripcion: "Diseño e implementación de carrusel de reseñas de clientes.", estado: "pendiente" },
  { id: 108, fecha: "2023-10-18", asunto: "Error en Formulario de Contacto", descripcion: "Los correos no están llegando al sistema CRM.", estado: "urgente" },
  { id: 105, fecha: "2023-10-15", asunto: "Integración de API de Pagos", descripcion: "Conectar Stripe para procesar suscripciones mensuales.", estado: "completado" },
  { id: 102, fecha: "2023-10-10", asunto: "Ajuste de Colores Landing", descripcion: "Actualizar paleta según nueva guía de estilos.", estado: "completado" },
  { id: 101, fecha: "2023-10-08", asunto: "Migración a App Router", descripcion: "Actualizar el proyecto de pages router a app router.", estado: "completado" },
  { id: 99, fecha: "2023-10-05", asunto: "Bug en Checkout Mobile", descripcion: "El botón de pago queda tapado por el teclado en iOS.", estado: "urgente" },
  { id: 97, fecha: "2023-10-02", asunto: "Dashboard de Métricas", descripcion: "Agregar gráfico de tickets resueltos por semana.", estado: "en_progreso" },
  { id: 95, fecha: "2023-09-28", asunto: "Refactor de Auth", descripcion: "Migrar lógica de sesión a NextAuth con roles.", estado: "completado" },
  { id: 93, fecha: "2023-09-25", asunto: "Optimizar Imágenes", descripcion: "Usar next/image en todas las vistas públicas.", estado: "completado" },
  { id: 91, fecha: "2023-09-20", asunto: "Notificaciones por Email", descripcion: "Enviar confirmación al crear un ticket nuevo.", estado: "pendiente" },
  { id: 90, fecha: "2023-09-18", asunto: "Filtro por Prioridad", descripcion: "Agregar filtro combinado prioridad + estado en tabla.", estado: "pendiente" },
  { id: 88, fecha: "2023-09-14", asunto: "Modo Oscuro", descripcion: "Soporte de dark mode en dashboard de developer.", estado: "en_progreso" },
  { id: 86, fecha: "2023-09-10", asunto: "Exportar Reporte PDF", descripcion: "Botón para exportar historial de tickets a PDF.", estado: "pendiente" },
  { id: 84, fecha: "2023-09-05", asunto: "Revisión de Accesibilidad", descripcion: "Auditar contraste y foco de teclado en formularios.", estado: "completado" },
  { id: 82, fecha: "2023-08-30", asunto: "Cache de Consultas Supabase", descripcion: "Agregar revalidate en queries de proyectos.", estado: "completado" },
  { id: 80, fecha: "2023-08-24", asunto: "Error 500 en Login", descripcion: "Falla intermitente al autenticar con Google OAuth.", estado: "urgente" },
  { id: 78, fecha: "2023-08-20", asunto: "Rediseño de Sidebar", descripcion: "Unificar iconografía y estados activos del menú.", estado: "completado" },
  { id: 76, fecha: "2023-08-15", asunto: "Paginación de Proyectos", descripcion: "Agregar paginación server-side en /dev/projects.", estado: "en_progreso" },
  { id: 74, fecha: "2023-08-10", asunto: "Test E2E Checkout", descripcion: "Cobertura Playwright del flujo de pago completo.", estado: "pendiente" },
  { id: 72, fecha: "2023-08-05", asunto: "Ajuste de SEO", descripcion: "Metadata dinámica por proyecto para compartir en redes.", estado: "completado" },
  { id: 70, fecha: "2023-07-30", asunto: "Webhook de Stripe", descripcion: "Registrar eventos de pago fallido en tabla tickets.", estado: "completado" },
  { id: 68, fecha: "2023-07-25", asunto: "Límite de Adjuntos", descripcion: "Validar tamaño máximo de archivos en tickets.", estado: "pendiente" },
  { id: 66, fecha: "2023-07-20", asunto: "Onboarding de Cliente", descripcion: "Flujo guiado al crear el primer proyecto.", estado: "completado" },
];