import assert from "node:assert/strict";
import test from "node:test";

import { parseReply } from "./protocol";

test("separa prosa de archivos", () => {
  const { prose, files } = parseReply(
    'Listo, arme el hero.\n<file path="/App.tsx">\nexport default function App() {}\n</file>\nDecime si lo cambio.',
  );

  assert.equal(prose, "Listo, arme el hero.\n\nDecime si lo cambio.");
  assert.deepEqual(Object.keys(files), ["/App.tsx"]);
  assert.equal(files["/App.tsx"], "export default function App() {}\n");
});

test("un bloque sin cerrar (stream a medio recibir) igual devuelve contenido parcial", () => {
  const { prose, files } = parseReply(
    'Escribiendo.\n<file path="/App.tsx">\nexport default function App() {\n  return <div',
  );

  assert.equal(prose, "Escribiendo.");
  assert.equal(files["/App.tsx"], "export default function App() {\n  return <div");
});

test("descarta la etiqueta de apertura cortada al medio", () => {
  assert.equal(parseReply("Ahi va.\n<file pa").prose, "Ahi va.");
  assert.equal(parseReply("Ahi va.\n<").prose, "Ahi va.");
});

test("normaliza paths sin barra inicial y acepta varios archivos", () => {
  const { files } = parseReply(
    '<file path="App.tsx">a</file><file path="/components/Hero.tsx">b</file>',
  );

  assert.deepEqual(files, { "/App.tsx": "a", "/components/Hero.tsx": "b" });
});

test("openPath marca el archivo que la IA todavia esta escribiendo", () => {
  assert.equal(parseReply('<file path="/App.tsx">a</file>').openPath, null);
  assert.equal(parseReply('<file path="/App.tsx">a').openPath, "/App.tsx");
  assert.equal(
    parseReply('<file path="/App.tsx">a</file><file path="/b.tsx">b').openPath,
    "/b.tsx",
  );
  assert.equal(parseReply("solo prosa").openPath, null);
});
