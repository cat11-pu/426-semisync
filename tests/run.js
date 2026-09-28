import assert from "node:assert";
import { watermarkOf, keptAfter, degradeAt } from "../semisync.js";
import { step, close } from "../syncrun.js";
import { render } from "../app.js";

const base = {
  budget: 1, quorum: 2, grace: 2,
  state: { replicas: [["a", 0], ["b", 0]], pending: [], committed: 0, nextw: 1,
           mode: "sync", waiting: 0, degrades: 0, ledger: [], applied: [] },
  events: [{ id: 1, kind: "put" }],
  bad_w_code: "E_BAD_W", no_replica_code: "E_NO_REPLICA", event_error_code: "E_BAD_EVENT"
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("watermarkOf returns a number", () => {
  assert.strictEqual(typeof watermarkOf(base.state.replicas, 2), "number");
});

check("keptAfter returns a list", () => {
  assert.ok(Array.isArray(keptAfter([1, 2], 0)));
});

check("degradeAt returns a boolean", () => {
  assert.strictEqual(typeof degradeAt(1, 2), "boolean");
});

check("step returns a state", () => {
  assert.strictEqual(typeof step(base).state, "object");
});

check("render counts events", () => {
  assert.strictEqual(typeof render(base).count_events, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
