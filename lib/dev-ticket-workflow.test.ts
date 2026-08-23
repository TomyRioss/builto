import assert from "node:assert/strict";
import test from "node:test";
import { getDeveloperTicketAction, getDeveloperTicketLabel } from "./dev/ticket-workflow.ts";

test("solo un ticket pagado y libre puede tomarse", () => {
  assert.equal(getDeveloperTicketAction("PAID", null, "dev-1"), "take");
  assert.equal(getDeveloperTicketAction("PENDING", null, "dev-1"), "readonly");
  assert.equal(getDeveloperTicketAction("ACCEPTED", null, "dev-1"), "readonly");
});

test("el developer asignado puede iniciar y gestionar el trabajo", () => {
  assert.equal(getDeveloperTicketAction("PAID", "dev-1", "dev-1"), "start");
  assert.equal(getDeveloperTicketAction("IN_PROGRESS", "dev-1", "dev-1"), "work");
  assert.equal(getDeveloperTicketAction("REVIEW", "dev-1", "dev-1"), "waiting");
});

test("otro developer no puede operar el ticket", () => {
  assert.equal(getDeveloperTicketAction("PAID", "dev-2", "dev-1"), "readonly");
  assert.equal(getDeveloperTicketAction("IN_PROGRESS", "dev-2", "dev-1"), "readonly");
});

test("un ticket completado siempre queda en solo lectura", () => {
  assert.equal(getDeveloperTicketAction("DONE", "dev-1", "dev-1"), "complete");
});

test("la interfaz developer traduce solo el flujo tecnico", () => {
  assert.equal(getDeveloperTicketLabel("PAID", null, "dev-1"), "Disponible");
  assert.equal(getDeveloperTicketLabel("PAID", "dev-1", "dev-1"), "Asignado a vos");
  assert.equal(getDeveloperTicketLabel("IN_PROGRESS", "dev-1", "dev-1"), "En desarrollo");
  assert.equal(getDeveloperTicketLabel("REVIEW", "dev-1", "dev-1"), "En revision");
  assert.equal(getDeveloperTicketLabel("DONE", "dev-1", "dev-1"), "Completado");
});

test("los estados comerciales no se presentan como trabajo disponible", () => {
  assert.equal(getDeveloperTicketLabel("PENDING", null, "dev-1"), "No disponible");
  assert.equal(getDeveloperTicketLabel("ACCEPTED", null, "dev-1"), "No disponible");
});
