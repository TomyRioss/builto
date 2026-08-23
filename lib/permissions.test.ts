import assert from "node:assert/strict";
import test from "node:test";

import {
  atLeast,
  canAuditMessages,
  canManageStaff,
  canQuote,
  canSeeTransactions,
  isStaff,
} from "./permissions.ts";

test("un USER no accede a nada del panel interno", () => {
  assert.equal(isStaff("USER"), false);
  assert.equal(canQuote("USER"), false);
  assert.equal(canSeeTransactions("USER"), false);
  assert.equal(canAuditMessages("USER"), false);
  assert.equal(canManageStaff("USER"), false);
});

test("un DEV entra al panel pero no cotiza ni ve plata", () => {
  assert.equal(isStaff("DEV"), true);
  assert.equal(canQuote("DEV"), false);
  assert.equal(canSeeTransactions("DEV"), false);
  assert.equal(canAuditMessages("DEV"), false);
});

test("ADMIN cotiza y audita, pero no toca staff", () => {
  assert.equal(canQuote("ADMIN"), true);
  assert.equal(canSeeTransactions("ADMIN"), true);
  assert.equal(canAuditMessages("ADMIN"), true);
  assert.equal(canManageStaff("ADMIN"), false);
});

test("OWNER puede todo", () => {
  assert.equal(canQuote("OWNER"), true);
  assert.equal(canSeeTransactions("OWNER"), true);
  assert.equal(canManageStaff("OWNER"), true);
});

test("atLeast es reflexivo y ordena la jerarquia", () => {
  assert.equal(atLeast("DEV", "DEV"), true);
  assert.equal(atLeast("OWNER", "USER"), true);
  assert.equal(atLeast("USER", "OWNER"), false);
});
