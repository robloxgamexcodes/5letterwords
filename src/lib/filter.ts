export type Base = { kind: 'start' | 'end' | 'contain'; value: string } | null;
export type Query = {
  len: number;
  right: string[]; wrong: string[]; dead: string[];
  begins: string; ends: string; run: string; rack: string; only: string;
  repeats: boolean;
};

export const clean = (v: string, max = 40) => v.toLowerCase().replace(/[^a-z]/g, '').slice(0, max);
export const cleanRun = (v: string, max = 7) => v.toLowerCase().replace(/[^a-z_?]/g, '').slice(0, max);
export const cleanRack = (v: string, max = 20) => v.toLowerCase().replace(/[^a-z?*]/g, '').slice(0, max);

const countOf = (word: string, ch: string) => {
  let n = 0;
  for (const c of word) if (c === ch) n++;
  return n;
};

export function hasActiveFilter(q: Query) {
  return (
    q.right.some(Boolean) || q.wrong.some(Boolean) || q.dead.some(Boolean) ||
    !!(q.begins || q.ends || q.run || q.rack || q.only)
  );
}

/** Compile the clue set into a fast predicate. */
export function compile(q: Query): (word: string) => boolean {
  const right = q.right.map((c) => clean(c, 1));
  const wrong = q.wrong.map((c) => clean(c, 1));
  const dead = new Set(q.dead.map((c) => clean(c, 1)).filter(Boolean));

  // How many copies of each letter the clues say the answer holds.
  const required = new Map<string, number>();
  if (q.repeats) {
    for (const c of [...right, ...wrong]) if (c) required.set(c, (required.get(c) || 0) + 1);
  } else {
    for (const c of [...right, ...wrong]) if (c) required.set(c, 1);
  }
  const begins = clean(q.begins, q.len);
  const ends = clean(q.ends, q.len);
  const run = cleanRun(q.run, q.len);
  const rackRaw = cleanRack(q.rack);
  const rackBlanks = [...rackRaw].filter((c) => c === '?' || c === '*').length;
  const rackCounts = new Map<string, number>();
  for (const c of rackRaw) if (c !== '?' && c !== '*') rackCounts.set(c, (rackCounts.get(c) || 0) + 1);
  const only = new Set(clean(q.only, 26));

  return (word) => {
    for (let i = 0; i < q.len; i++) {
      if (right[i] && word[i] !== right[i]) return false;
      if (wrong[i] && word[i] === wrong[i]) return false;
    }
    for (const [ch, need] of required) if (countOf(word, ch) < need) return false;
    for (const ch of dead) if (countOf(word, ch) > (required.get(ch) || 0)) return false;
    if (begins && !word.startsWith(begins)) return false;
    if (ends && !word.endsWith(ends)) return false;
    if (run) {
      let hit = false;
      for (let off = 0; off + run.length <= word.length && !hit; off++) {
        hit = true;
        for (let j = 0; j < run.length; j++) {
          const p = run[j];
          if (p !== '_' && p !== '?' && word[off + j] !== p) { hit = false; break; }
        }
      }
      if (!hit) return false;
    }
    if (rackRaw) {
      const seen = new Map<string, number>();
      let deficit = 0;
      for (const ch of word) {
        const n = (seen.get(ch) || 0) + 1;
        seen.set(ch, n);
        if (n > (rackCounts.get(ch) || 0)) deficit++;
      }
      if (deficit > rackBlanks) return false;
    }
    if (only.size) for (const ch of word) if (!only.has(ch)) return false;
    return true;
  };
}

export function matchesBase(word: string, base: Base) {
  if (!base) return true;
  return base.kind === 'start' ? word.startsWith(base.value) : base.kind === 'end' ? word.endsWith(base.value) : word.includes(base.value);
}
