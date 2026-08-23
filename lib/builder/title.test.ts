import assert from "node:assert/strict";
import test from "node:test";

import { normalizeTitle, shouldRename } from "./title";

test("dispara cada ~5 mensajes, con el contador saltando de a 2", () => {
  // turno 1 -> 2 mensajes, turno 2 -> 4, y asi.
  assert.equal(shouldRename(2), false);
  assert.equal(shouldRename(4), false);
  assert.equal(shouldRename(6), true);
  assert.equal(shouldRename(8), false);
  assert.equal(shouldRename(10), true);
  assert.equal(shouldRename(12), false);
  assert.equal(shouldRename(14), false);
  assert.equal(shouldRename(16), true);
});

test("no dispara antes del primer umbral", () => {
  assert.equal(shouldRename(0), false);
  assert.equal(shouldRename(2), false);
});

test("limpia comillas, punto final y espacios de sobra", () => {
  assert.equal(normalizeTitle('  "Landing para estudio juridico."  '), "Landing para estudio juridico");
  assert.equal(normalizeTitle("Tienda   de\nplantas"), "Tienda de plantas");
  assert.equal(normalizeTitle("   "), "");
});

test("recorta titulos largos a 40 caracteres", () => {
  const title = normalizeTitle("Landing institucional para un estudio juridico de Buenos Aires");
  assert.ok(title.length <= 40, `mide ${title.length}`);
  assert.ok(title.endsWith("…"));
});
