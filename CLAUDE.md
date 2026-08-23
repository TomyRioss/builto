@AGENTS.md
@DESIGN.md

# Reglas del proyecto

Estas reglas son obligatorias. Ante conflicto, gana la instrucción explícita del usuario en el mensaje actual.

## 0. Antes de escribir código (OBLIGATORIO)

Antes de cualquier cambio o feature nueva:

1. Buscar si una librería ya resuelve el problema — primero entre las ya instaladas (`package.json`), después entre las de terceros disponibles.
2. Si existe, instalarla/usarla en vez de escribir la lógica a mano. Plantear cuál y por qué en una línea.
3. Si no existe, recién ahí escribir código propio.

Aplica a lógica y a interfaz por igual. No reinventar lo que ya está resuelto.

## 1. Modo de trabajo

- Usar siempre `/caveman ultra` (respuestas ultra comprimidas, sustancia técnica intacta).
- Explicar **qué** se va a hacer, **qué resuelve** y **cómo**, antes de proponer un plan. Sin eso el plan se rechaza.
- No hacer nada más de lo pedido.
- Ante un problema desconocido: buscar en internet y comunidades (StackOverflow, Reddit, GitHub issues, docs oficiales) antes de improvisar.

## 2. Errores

Todo error se catchea. Sin excepción. Cada catch debe producir:

- **Consola**: log con contexto (qué operación, qué input, error real).
- **UI**: feedback visual al usuario (toast, estado de error, mensaje inline). Nunca fallar en silencio.

## 3. Estilos

- TailwindCSS para todo el CSS.
- Prohibido CSS puro / archivos `.css` propios / estilos inline salvo que Tailwind no lo permita (y avisarlo).
- **Nunca** tocar `global.css`.
- Tokens de color, tipografía, radios y spacing: los de `DESIGN.md` (paleta Monolith Ultra). No inventar colores.
- Color secundario: morado `#4648d4` (fondo claro `#eef2ff`, borde `#c0c1ff`). Uso restringido: estado activo, acciones IA/"magic", chips de review.

## 3.1 Tipografía y espacio

- Fuente única: **Inter**, siempre. Fallback en este orden exacto:
  `Inter, Helvetica, "Open Sans", Roboto, Verdana, Georgia, sans-serif`.
  No introducir otras familias ni pares de fuentes.
- **Jerarquía clara**: el contraste se hace con peso y escala, nunca con color. Escala y pesos: los de `DESIGN.md` (`display-lg`, `headline-lg`, `title-md`, `body-lg`, `body-sm`, `label-caps`). No inventar tamaños intermedios.
- Títulos: `font-semibold`, letter-spacing negativo (`-0.01em` / `-0.02em`). Cuerpo: `font-normal`. Labels chicos: mayúsculas con `tracking-[0.05em]`.
- Cuerpo de texto entre 65 y 75 caracteres por línea como máximo.
- **Interfaz con mucho aire**: espaciado múltiplo de 4px, gap de 80px entre bloques mayores, márgenes 40px en desktop y 16px en mobile. Ante la duda, más espacio y menos elementos. El vacío es parte del diseño, no espacio a rellenar.

## 4. Componentes

- shadcn/ui para todo componente prefabricado general (button, dialog, input, select, table, etc.). No escribir a mano lo que shadcn ya provee.
- Diseño responsivo siempre: mobile y desktop. Ambos se piensan desde el inicio, no se parchean después.
- Máximo **500 líneas** por componente. Si se pasa, modularizar (subcomponentes, hooks, utils).
- Arquitectura MVC + componentes modulares: separar vista, lógica/estado y acceso a datos.

## 5. Imágenes e iconos

- **Nunca** generar SVG a mano para iconos o ilustraciones.
- Iconos: `react-icons` (o el set de iconos ya instalado).
- Imágenes: fuentes reales (Pexels, Unsplash u otro asset provisto).

## 6. Base de datos

- **Nunca** ejecutar comandos de DB, Prisma o migraciones sin permiso explícito del usuario en ese mismo mensaje.
- Todo cambio de schema se pregunta primero y se espera confirmación escrita.

---

# Skills por tarea

| Tarea | Skill / herramienta | Modelo |
|---|---|---|
| Base de datos, auth, índices, migraciones | `supabase/agent-skills` + MCP Supabase | sonnet |
| Testing e interacción con navegador | skill `playwright` (+ `/caveman ultra` para minimizar tokens) | haiku |
| Review y auditoría de código | `code-simplifier`, `code-reviewer` | haiku |
| Commits y GitHub | `commit-commands` + MCP GitHub | — |
| Componentes y diseño | `frontend-design` + `impeccable` + `superpowers:brainstorming` + `ui-ux-pro-max` + `expo-design` (SIEMPRE juntas) | — |

Ejemplos de disparo de Supabase: "Help me set up Supabase Auth with Next.js", "Help me add proper indexes to this table".

Para navegador con haiku: objetivo es gasto mínimo de tokens — acoplar `/caveman ultra`.
