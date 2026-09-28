// semisync.js：第门槛大的确认号、提交后留下的待确认、够不够降级（基线：一律给零与假）
export function watermarkOf(replicas, quorum) {
  return 0;
}

export function keptAfter(pending, committed) {
  return pending;
}

export function degradeAt(waiting, grace) {
  return false;
}
