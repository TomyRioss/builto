# Product

## Register

product

## Users

Dueños de negocio y makers no técnicos (o semi-técnicos) que necesitan un sitio web y no quieren escribir código. Trabajan desde su escritorio, en sesiones cortas y con foco: describen lo que quieren en lenguaje natural y esperan ver el sitio cambiar.

El trabajo a resolver: pasar de "necesito un sitio" a "mi sitio está publicado y lo puedo seguir editando", sin aprender una herramienta de diseño.

Segundo usuario: los **devs internos de Builto**. Cuando la IA no alcanza, el cliente abre un ticket y un dev de Builto entra al proyecto y lo edita a mano. El producto es híbrido IA + humano; la UI tiene que dejar claro en qué estado está cada pedido y quién lo está atendiendo.

## Product Purpose

Builto genera y edita sitios web mediante conversación con una IA (Co-Build), con una vía de escape humana: si algo excede a la IA, el usuario abre un ticket y un dev de Builto lo resuelve.

Éxito = el usuario publica su sitio sin tocar código, y cuando pide algo que la IA no puede hacer, no se queda trabado: el ticket es un camino visible y no un callejón sin salida.

## Brand Personality

Preciso, silencioso, premium.

Voz: directa, en segunda persona, verbos concretos. Sin exclamaciones, sin lenguaje de marketing dentro del producto. Un botón dice exactamente qué pasa al usarlo, y el nombre de la acción sobrevive todo el flujo ("Publicar" → "Publicado").

Emoción objetivo: confianza y calma. La interfaz se corre del medio para que el trabajo del usuario sea el protagonista.

## Anti-references

- SaaS genérico: gradientes violeta/índigo de fondo, blobs, cards idénticas en grilla de 3, métrica gigante con label chiquito en el hero.
- Eyebrows en mayúsculas con tracking arriba de cada sección.
- Chatbots con burbujas redondeadas tipo mensajería social; Co-Build es una herramienta de trabajo, no un chat de amigos.
- Herramientas de IA que esconden lo que hacen detrás de animaciones de "magia". El proceso se muestra, no se decora.
- Fondos crema/beige editoriales con serif de alto contraste — no es la marca.

## Design Principles

1. **La interfaz se calla.** El sitio del usuario es el contenido; el chrome de Builto es estructura, no decoración. Ante la duda, sacar.
2. **Mostrar el estado real.** Generando, listo, falló, esperando a un dev: cada operación tiene un estado visible y honesto. Nada falla en silencio y nada finge éxito.
3. **El escape humano es de primera clase.** Abrir un ticket no es una página de error; es una acción de producto con el mismo cuidado visual que la generación con IA.
4. **Una sola nota de color.** El índigo eléctrico marca lo interactivo, lo activo y lo asistido por IA. Todo lo demás es monocromo. Si el índigo está en todos lados, no significa nada.
5. **Precisión antes que densidad.** Alineación perfecta, trazos de 1px, espaciado múltiplo de 4px. El aire es parte del producto, no espacio desperdiciado.

## Accessibility & Inclusion

- WCAG 2.2 AA: contraste ≥4.5:1 en texto de cuerpo y placeholders, ≥3:1 en texto grande y bordes de controles.
- Foco de teclado siempre visible; todo flujo (login, Co-Build, tickets) operable sin mouse.
- `prefers-reduced-motion: reduce` respetado en toda animación — crossfade o transición instantánea como alternativa.
- El color nunca es el único portador de significado: los estados llevan además texto o icono.
