# Builto - Estado de funcionalidades

> [!NOTE]
> Este documento es el checklist vivo de Builto. Se actualiza cuando una funcionalidad se implementa, se conecta a Supabase o cambia de alcance.

> [!IMPORTANT]
> Una pantalla visible no se considera terminada si todavia usa datos fijos. Para marcar una funcionalidad como completa debe funcionar de punta a punta y tener estados de carga, vacio y error.

## Leyenda

- 🟩 `[x]` **Completo:** interfaz y logica conectadas a datos reales, verificadas de punta a punta.
- 🟨 `[x]` **Mock:** interfaz funcional con datos de demostracion, sin persistencia real.
- 🟧 `[x]` **Parcial:** existe una parte util, pero faltan comportamientos o integraciones importantes.
- 🟥 `[ ]` **Pendiente:** no esta implementado o la ruta solo muestra un estado preparado.

---

## Infraestructura y datos

- 🟩 [x] Proyecto Next.js con App Router, TypeScript y Tailwind CSS
- 🟩 [x] Componentes base con shadcn/ui y Radix UI
- 🟩 [x] Conexion de Prisma con PostgreSQL de Supabase
- 🟩 [x] URL agrupada para consultas de la aplicacion (`DATABASE_URL`)
- 🟩 [x] URL directa para Prisma CLI (`DIRECT_URL`)
- 🟩 [x] Esquema Prisma importado desde la base existente
- 🟩 [x] Cliente Prisma tipado y reutilizable para Next.js
- 🟩 [x] Generacion automatica de Prisma Client en `postinstall`
- 🟧 [x] Politicas RLS presentes en las tablas; falta validar su comportamiento con los roles de la aplicacion
- 🟥 [ ] Repositorios o servicios de acceso a datos por dominio
- 🟥 [ ] Validacion centralizada de variables de entorno
- 🟧 [x] Seed idempotente para cuentas `OWNER` y `DEV`; faltan datos de dominio
- 🟥 [ ] Manejo centralizado de errores y observabilidad

---

## Sitio publico (`/`)

- 🟩 [x] Landing responsive con identidad visual de Builto
- 🟩 [x] Navbar responsive
- 🟩 [x] Presentacion del producto y propuesta de valor
- 🟩 [x] Seccion de caracteristicas
- 🟩 [x] Vista previa visual del dashboard
- 🟩 [x] Seccion de plantillas
- 🟧 [x] CTA para comenzar un proyecto mediante correo; falta flujo interno
- 🟧 [x] Enlaces legales visibles; actualmente no tienen paginas de destino
- 🟥 [ ] Video demo real
- 🟥 [ ] Catalogo publico de plantillas
- 🟥 [ ] Pagina de privacidad
- 🟥 [ ] Pagina de terminos y condiciones

---

## Autenticacion y autorizacion

- 🟩 [x] Registro de cliente con credenciales
- 🟩 [x] Inicio de sesion con credenciales o Google
- 🟩 [x] Cierre de sesion
- 🟩 [x] Persistencia de sesion con NextAuth
- 🟥 [ ] Verificacion de correo electronico
- 🟥 [ ] Recuperacion y cambio de contrasena
- 🟩 [x] Proteccion de rutas privadas
- 🟥 [ ] Redireccion segun rol
- 🟩 [x] Roles `USER`, `DEV`, `ADMIN` y `OWNER` integrados en la sesion
- 🟩 [x] Aplicacion de permisos reales en consultas y acciones del servidor
- 🟥 [ ] Perfil y configuracion de cuenta

---

## Panel de cliente (`/client`)

### Navegacion y resumen

- 🟨 [x] Sidebar responsive con navegacion; usuario y datos fijos
- 🟨 [x] Bienvenida y resumen de tareas pendientes
- 🟨 [x] Menu de notificaciones con estado vacio
- 🟨 [x] Actividad reciente con datos de demostracion
- 🟥 [ ] Cargar usuario autenticado desde la base
- 🟥 [ ] Cargar notificaciones reales

### Proyectos

- 🟨 [x] Tarjetas de proyectos recientes con estados e imagenes de demostracion
- 🟧 [x] Acceso "Ver todos" visible; actualmente vuelve a la misma seccion
- 🟥 [ ] Listado completo de proyectos del cliente
- 🟥 [ ] Detalle de proyecto
- 🟥 [ ] Crear proyecto
- 🟥 [ ] Editar nombre, brief y configuracion del proyecto
- 🟥 [ ] Archivar y restaurar proyecto
- 🟥 [ ] Historial de versiones
- 🟥 [ ] Vista previa y publicacion del proyecto

### Constructor con IA

- 🟧 [x] Accion visual para iniciar un proyecto; actualmente informa que estara disponible proximamente
- 🟥 [ ] Crear conversacion con IA
- 🟥 [ ] Enviar y recibir mensajes en tiempo real
- 🟥 [ ] Generar propuesta inicial desde un brief
- 🟥 [ ] Aplicar cambios al proyecto desde la conversacion
- 🟥 [ ] Mostrar estados de generacion, error y reintento
- 🟥 [ ] Guardar archivos y revisiones generadas
- 🟥 [ ] Previsualizar el resultado durante la construccion

### Plantillas

- 🟧 [x] Accion visual para abrir la biblioteca; sin pagina ni datos reales
- 🟥 [ ] Listado y filtros de plantillas
- 🟥 [ ] Vista previa de plantilla
- 🟥 [ ] Crear proyecto desde una plantilla

### Tickets y soporte humano

- 🟧 [x] Seccion informativa preparada en el panel del cliente
- 🟩 [x] Acceso a soporte por correo electronico
- 🟥 [ ] Crear ticket asociado a un proyecto
- 🟥 [ ] Listar tickets propios
- 🟥 [ ] Ver estado y detalle de un ticket
- 🟥 [ ] Conversar con el desarrollador asignado
- 🟥 [ ] Recibir y aceptar o rechazar una cotizacion
- 🟥 [ ] Aprobar la entrega o solicitar correcciones

---

## Panel interno (`/dashboard`)

### Navegacion y permisos

- 🟩 [x] Sidebar responsive para el dashboard
- 🟩 [x] Usuario y rol resueltos desde la sesion real
- 🟩 [x] Permisos aplicados en consultas y acciones del servidor

### Inicio (`/dashboard`)

- 🟨 [x] Tarjetas de resumen operativo con datos de demostracion
- 🟨 [x] Actividad reciente con datos de demostracion
- 🟨 [x] Accesos rapidos a tickets y proyectos
- 🟥 [ ] Calcular metricas desde Supabase
- 🟥 [ ] Actualizacion y estados de carga reales

### Panel de desarrollo (`/dev/dashboard`)

- 🟩 [x] Dashboard Developer integrado con la identidad visual del espacio `/dev`
- 🟩 [x] Acceso restringido a roles internos (`DEV`, `ADMIN` y `OWNER`)
- 🟩 [x] Nombre del usuario obtenido desde la sesion real
- 🟩 [x] Resumen de proyectos disponibles y tickets propios desde Supabase
- 🟩 [x] Redireccion automatica de usuarios `DEV` despues del login

### Proyectos Developer (`/dev/projects`)

- 🟩 [x] Listado de todos los proyectos reales de Supabase
- 🟩 [x] Acceso restringido a roles internos y navegación Developer responsive
- 🟩 [x] Búsqueda por proyecto, cliente, tecnología y ticket
- 🟩 [x] Filtros por prioridad y tecnología disponibles en `Project.brief`
  - 🟩 [x] Estados de carga, vacío y error
  - 🟩 [x] Detalle de proyecto con todos sus tickets asociados en modo lectura
  - 🟩 [x] Asignación atómica de tickets pagados al Developer autenticado
  - 🟩 [x] Flujo Developer `PAID` → `IN_PROGRESS` → `REVIEW`
  - 🟩 [x] Navegación al workspace existente con contexto de proyecto y ticket
  - 🟥 [ ] Correcciones solicitadas; el modelo actual no tiene estado equivalente
  - 🟥 [ ] Aprobación y cierre del ticket por parte del cliente

### Tickets (`/dashboard/tickets`)

- 🟩 [x] Listado responsive de tickets reales desde Supabase
- 🟥 [ ] Busqueda por identificador, titulo o cliente
- 🟥 [ ] Filtros visuales por estado
- 🟩 [x] Estado vacio cuando no existen tickets
- 🟩 [x] Crear ticket asociado a un proyecto
- 🟥 [ ] Filtrar por todos los estados del modelo
- 🟥 [ ] Ver detalle del ticket
- 🟥 [ ] Asignar desarrollador
- 🟥 [ ] Cambiar estado y prioridad
- 🟥 [ ] Crear y enviar cotizacion
- 🟥 [ ] Conversacion interna y con el cliente

### Proyectos (`/dashboard/projects`)

- 🟩 [x] Listar todos los proyectos desde Supabase
- 🟥 [ ] Buscar proyectos
- 🟥 [ ] Filtrar por estado
- 🟥 [ ] Ver detalle, archivos y versiones
- 🟥 [ ] Cambiar estado del proyecto
- 🟥 [ ] Consultar tickets y conversaciones asociados

### Usuarios (`/dashboard/users`)

- 🟥 [ ] Listar y buscar usuarios
- 🟥 [ ] Filtrar por rol y estado
- 🟥 [ ] Ver detalle del usuario
- 🟥 [ ] Cambiar rol
- 🟥 [ ] Activar o desactivar cuenta
- 🟥 [ ] Ver proyectos y tickets relacionados

### Mensajes (`/dashboard/messages`)

- 🟥 [ ] Bandeja de conversaciones
- 🟥 [ ] Contador y filtro de mensajes no leidos
- 🟥 [ ] Conversacion en tiempo real
- 🟥 [ ] Enviar mensajes como miembro del equipo
- 🟥 [ ] Marcar conversacion como leida

### Transacciones (`/dashboard/transactions`)

- 🟥 [ ] Listar pagos y filtrar por estado
- 🟥 [ ] Ver detalle y referencia del proveedor
- 🟥 [ ] Registrar pago manual
- 🟥 [ ] Integracion con Mercado Pago
- 🟥 [ ] Confirmacion segura mediante webhook
- 🟥 [ ] Reembolsos y estados fallidos

### Historiales

- 🟥 [ ] Historial de acciones del equipo
- 🟥 [ ] Filtros por actor, entidad, accion y fecha
- 🟥 [ ] Historial global de mensajes
- 🟥 [ ] Busqueda y paginacion de eventos

---

## Archivos y versiones

- 🟥 [ ] Subir assets de un proyecto
- 🟥 [ ] Validar tipo y tamano de archivos
- 🟥 [ ] Guardar assets en Supabase Storage
- 🟥 [ ] Listar y descargar assets
- 🟥 [ ] Crear versiones del proyecto
- 🟥 [ ] Guardar revisiones de archivos por version
- 🟥 [ ] Comparar versiones
- 🟥 [ ] Restaurar una version anterior

---

## Calidad y entrega

- 🟩 [x] Compilacion de produccion funcionando
- 🟩 [x] ESLint sin errores actuales
- 🟩 [x] Diseno responsive base en landing y paneles existentes
- 🟥 [ ] Pruebas unitarias de logica de negocio
- 🟥 [ ] Pruebas de integracion con Supabase
- 🟥 [ ] Pruebas end-to-end de los flujos principales
- 🟥 [ ] Validacion responsive automatizada en mobile y desktop
- 🟥 [ ] Auditoria completa de accesibilidad
- 🟥 [ ] Manejo visual consistente de carga, exito, vacio y error
- 🟥 [ ] Pipeline de CI
- 🟥 [ ] Despliegue de produccion

---

## Convenciones de mantenimiento

1. Toda funcionalidad nueva comienza como 🟥 `[ ]`.
2. Si la interfaz funciona con datos fijos, se marca 🟨 `[x]`.
3. Si una parte funciona pero tiene una limitacion relevante, se marca 🟧 `[x]` y se explica brevemente la limitacion.
4. Solo se marca 🟩 `[x]` cuando el flujo completo usa datos reales y fue probado.
5. Cada cambio funcional debe actualizar este documento en la misma tarea.
6. Los cambios de esquema, datos, permisos o politicas de Supabase requieren autorizacion explicita antes de ejecutarse.
