// Check minimo del cronograma: `node --experimental-strip-types lib/dashboard/ticket-progress.check.ts`
import assert from "node:assert/strict";

import { ticketProgress } from "./ticket-progress.ts";

const createdAt = new Date("2026-08-01T10:00:00Z");
const updatedAt = new Date("2026-08-10T10:00:00Z");

const pending = ticketProgress({ status: "PENDING", createdAt, updatedAt, quotedAt: null });
assert.equal(pending.percent, 10);
assert.equal(pending.stages[0].state, "current");
assert.equal(pending.stages[1].state, "pending");
assert.equal(pending.stages[0].at, createdAt);

const review = ticketProgress({ status: "REVIEW", createdAt, updatedAt, quotedAt: updatedAt });
assert.equal(review.currentLabel, "Control de calidad");
assert.equal(review.stages.filter((s) => s.state === "done").length, 3);
assert.equal(review.stages[3].at, updatedAt);

const done = ticketProgress({ status: "DONE", createdAt, updatedAt, quotedAt: null });
assert.equal(done.percent, 100);
assert.equal(done.stages[1].at, null);

const cancelled = ticketProgress({ status: "CANCELLED", createdAt, updatedAt, quotedAt: null });
assert.equal(cancelled.closed, true);
assert.ok(!cancelled.stages.some((s) => s.state === "current"));

console.log("ticket-progress OK");
