@AGENTS.md

# Instrucciones de desarrollo para Claude

Estas reglas son obligatorias para cualquier tarea realizada en este repositorio. Si una instrucción entra en conflicto con una solicitud explícita del usuario, detente, explica el conflicto y solicita confirmación antes de continuar.

## Regla principal

- Utiliza siempre la skill `/cavemen ultra` durante el trabajo.
- Antes de modificar código o añadir una funcionalidad, investiga obligatoriamente si existe una solución de terceros adecuada, tanto entre las dependencias ya instaladas como entre las librerías disponibles para instalar.
- Si existe una librería mantenida, segura y compatible que resuelva el problema, informa brevemente cuál es, por qué conviene utilizarla y úsala en lugar de implementar la solución desde cero. Si requiere instalar una dependencia nueva, indícalo claramente antes de incorporarla.
- Si no existe una alternativa adecuada, documenta brevemente la investigación realizada y continúa con una implementación propia.

## Flujo de trabajo obligatorio

1. Comprende el objetivo y revisa la arquitectura, dependencias y convenciones existentes del proyecto.
2. Investiga librerías instaladas o instalables que puedan resolver la lógica, interfaz o funcionalidad solicitada.
3. Presenta la alternativa recomendada cuando corresponda.
4. Identifica si el trabajo requiere cambios en la base de datos. Si los requiere, solicita consentimiento explícito antes de realizar cualquier modificación.
5. Implementa la solución respetando las reglas de arquitectura, UI, manejo de errores y modularidad descritas en este documento.
6. Valida el resultado mediante pruebas, revisión de código e interacción real con la interfaz cuando corresponda.

## Investigación y resolución de problemas

- Ante cualquier problema desconocido, investiga antes de improvisar una solución.
- Consulta documentación oficial como fuente principal y complementa la investigación con fuentes de la comunidad, como Stack Overflow, Reddit y sitios relacionados, cuando puedan aportar casos reales o limitaciones conocidas.
- Contrasta la información encontrada y evita copiar soluciones sin verificar su vigencia, seguridad y compatibilidad con este proyecto.
- Para problemas de lógica o interfaz, comprueba siempre si una librería de terceros ya ofrece una solución estable.

## Manejo de errores y feedback

- Captura y maneja todos los errores previsibles. No dejes promesas rechazadas, excepciones o estados de error sin tratamiento.
- Registra en consola información útil para diagnóstico, evitando exponer secretos, credenciales o datos sensibles.
- Muestra siempre feedback visual claro y accesible al usuario: estados de carga, éxito, vacío y error según corresponda.
- Los mensajes de UI deben explicar qué ocurrió y, cuando sea posible, cómo recuperarse o volver a intentar la acción.

## UI, estilos y diseño

- Utiliza siempre `shadcn/ui` para componentes prefabricados de propósito general cuando exista un componente adecuado.
- Utiliza siempre Tailwind CSS para estilos. Evita CSS puro, estilos inline y archivos CSS adicionales.
- Nunca modifiques `global.css`.
- Diseña y valida todas las interfaces de forma responsiva tanto para mobile como para desktop.
- Considera accesibilidad, jerarquía visual, estados interactivos, navegación por teclado y contraste.
- Para componentes y tareas de diseño, utiliza siempre en conjunto:
  - `frontend-design`
  - `impeccable`
  - la skill `brainstorming` de `superpowers@claude-plugins-official`
  - `ui-ux-pro-max@ui-ux-pro-max-skill`
  - `expo-design`

## Imágenes e iconos

- Nunca dibujes, generes ni implementes imágenes o iconos manualmente en SVG.
- Para iconos, utiliza fuentes o librerías reales y reconocidas, como `react-icons` u otra librería de iconos compatible ya adoptada por el proyecto.
- Para fotografías e imágenes, utiliza recursos reales procedentes de Pexels u otra fuente autorizada, respetando sus licencias y condiciones de uso.
- No reemplaces imágenes reales con SVG inventados ni con placeholders dibujados manualmente.

## Arquitectura y modularidad

- Organiza el código siguiendo una separación de responsabilidades inspirada en MVC, adaptada correctamente a la arquitectura y convenciones del framework utilizado.
- Construye componentes modulares, reutilizables y con una única responsabilidad clara.
- Ningún componente puede superar las 500 líneas. Si se aproxima a ese tamaño, divídelo antes de continuar.
- Separa la lógica de negocio, el acceso a datos, la presentación y el estado cuando corresponda.
- Evita duplicación, abstracciones innecesarias y componentes monolíticos.

## Base de datos

- Nunca realices cambios en la base de datos sin consentimiento explícito del usuario en un mensaje.
- Se consideran cambios de base de datos, entre otros: migraciones, cambios de esquema, creación o eliminación de tablas, columnas, índices, constraints, políticas, triggers, funciones, datos, permisos o configuración.
- Antes de solicitar autorización, explica con precisión qué se cambiará, por qué es necesario, el impacto esperado y, cuando aplique, cómo revertirlo.
- Para cualquier acción relacionada con la base de datos, utiliza la skill `supabase/agent-skills`, el modelo `sonnet` y el MCP de Supabase.
- Ejemplos de tareas que deben seguir este flujo:
  - Configurar Supabase Auth con Next.js.
  - Añadir índices adecuados a una tabla.

## Pruebas y navegador

- Para pruebas e interacciones con el navegador, utiliza la skill de `playwright` con el modelo `haiku` y el menor gasto de tokens posible.
- Puedes combinarla con `/cavemen ultra` para optimizar el uso de tokens con `haiku`.
- Verifica los flujos principales, estados de error y comportamiento responsivo en mobile y desktop.

## Revisión y auditoría de código

- Para revisar, simplificar o auditar código, utiliza las skills `code-simplifier` y `code-reviewer` con el modelo `haiku`.
- Corrige los hallazgos relevantes y vuelve a validar el resultado antes de dar la tarea por terminada.

## Git y GitHub

- Para commits y demás acciones relacionadas con GitHub, utiliza las skills `commit-commands` y el MCP de GitHub.
- No realices commits, pushes, aperturas de pull requests ni otras acciones remotas salvo que el usuario las solicite o autorice explícitamente.
