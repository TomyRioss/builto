import assert from "node:assert/strict";
import test from "node:test";

import { shouldRetryMissingFiles } from "./builder/protocol.ts";

test("reintenta cuando una modificacion no incluye archivos", () => {
  assert.equal(
    shouldRetryMissingFiles(
      "Elimine la seccion de testimonios.",
      "Eliminame la seccion de testimonios",
    ),
    true,
  );
});

test("no reintenta cuando la respuesta incluye el archivo modificado", () => {
  assert.equal(
    shouldRetryMissingFiles(
      'Listo.\n<file path="/src/App.tsx">export default function App() { return null; }</file>',
      "Eliminame la seccion de testimonios",
    ),
    false,
  );
});

test("no fuerza codigo ante una consulta informativa", () => {
  assert.equal(
    shouldRetryMissingFiles("El proyecto usa React.", "Que tecnologia usa?"),
    false,
  );
});
