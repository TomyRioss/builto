import assert from "node:assert/strict";
import test from "node:test";
import { getPostLoginPath } from "./auth-redirect.ts";

test("un DEV entra a su dashboard por defecto", () => {
  assert.equal(getPostLoginPath("DEV"), "/dev/dashboard");
});

test("otros roles conservan el dashboard general", () => {
  assert.equal(getPostLoginPath("USER"), "/dashboard");
  assert.equal(getPostLoginPath("ADMIN"), "/admin/dashboard");
  assert.equal(getPostLoginPath("OWNER"), "/admin/dashboard");
});

test("un callback interno explicito tiene prioridad", () => {
  assert.equal(getPostLoginPath("DEV", "/dev/projects"), "/dev/projects");
});

test("no permite usar el callback para salir del sitio", () => {
  assert.equal(getPostLoginPath("DEV", "https://example.com"), "/dev/dashboard");
  assert.equal(getPostLoginPath("DEV", "//example.com"), "/dev/dashboard");
});
