// app.js：渲染结果
import { watermarkOf, keptAfter, degradeAt } from "./semisync.js";
import { step, close } from "./syncrun.js";

export function render(spec) {
  const events = spec.events || [];
  const half = Math.ceil(events.length / 2);
  const first = step(spec);
  const closed = close(Object.assign({}, spec, { state: first.state }));
  const r1 = step(Object.assign({}, spec, { events: events.slice(0, half) }));
  const r2 = step(Object.assign({}, spec, { state: r1.state, events: events.slice(half) }));
  const closedTwo = close(Object.assign({}, spec, { state: r2.state }));
  const replay = step(Object.assign({}, spec, { state: closed.state }));
  const wide = step(Object.assign({}, spec, { budget: spec.budget + 2 }));
  const full = step(Object.assign({}, spec, { events: events, budget: events.length + 2 }));
  const fullClosed = close(Object.assign({}, spec, { state: full.state }));
  const fingerprint = function (state) {
    return JSON.stringify({
      replicas: state.replicas, pending: state.pending, committed: state.committed,
      nextw: state.nextw, mode: state.mode, waiting: state.waiting, degrades: state.degrades,
      ledger: state.ledger, applied: state.applied.length
    });
  };
  const replicas = function (state) {
    return state.replicas.slice().sort(function (a, b) {
      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
    }).map(function (row) { return [row[0], row[1]]; });
  };
  const rows = function (list) {
    return (list || []).map(function (row) { return row.slice(); });
  };
  return { replicas: replicas(closed.state), committed: closed.state.committed,
           pending: (closed.state.pending || []).slice(), waiting: closed.state.waiting,
           mode: closed.state.mode === "async" ? "异步" : "同步", degrades: closed.state.degrades,
           served_first: first.served, served_wide: wide.served,
           pair_differs: first.served !== wide.served,
           ledger_before: first.ledger_before, ledger: rows(first.ledger),
           catchup_n: closed.catchup, ledger_after: closed.state.ledger.length,
           mid_differs: fingerprint(r2.state) !== fingerprint(first.state),
           closed_equal: fingerprint(closedTwo.state) === fingerprint(closed.state),
           replay_new: replay.served, judged: first.judged, judged_bound: first.judged_bound,
           full_diff: fingerprint(closed.state) === fingerprint(fullClosed.state) ? 0 : 1,
           count_events: events.length,
           tail: watermarkOf([["a", 3], ["b", 1], ["c", 2]], 2)
                 + keptAfter([1, 2, 3], 1).length
                 + (degradeAt(2, 2) ? 1 : 0) };
}
