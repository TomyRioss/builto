import { PREVIEW_CAPTURE_SCRIPT } from "@/lib/builder/template";

/**
 * Arma el /index.html del sandbox para un seed de plantilla.
 *
 * Mismo esqueleto que el starter (entry /src/main.tsx + script de captura
 * para las miniaturas), con title y fuentes propias de la plantilla.
 */
export function makeTemplateIndexHtml(options: {
  title: string;
  fontLinks?: string[];
}): string {
  const links = options.fontLinks ?? [];

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${links.map((href) => `    <link rel="stylesheet" href="${href}" />`).join("\n")}
    <title>${options.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
${PREVIEW_CAPTURE_SCRIPT}
  </body>
</html>
`;
}
