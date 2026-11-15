import { useMemo, useState } from 'react';
import { ANSWERS, VALID, scoreGuess, type Cell } from '../../lib/game';

type Row = { word: string; res: Cell[] };
const LABEL = ['Grey', 'Yellow', 'Green'];
const ALL = [...VALID];
const COMMON = new Set(ANSWERS);

export default function WordleHelper() {
  const [rows, setRows] = useState<Row[]>([]);
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');
  const [showAll, setShowAll] = useState(false);

  const add = () => {
    const w = draft.trim().toLowerCase();
    if (w.length !== 5) return setErr('Type a 5 letter word first.');
    if (!VALID.has(w)) return setErr(`"${w}" is not in our word list.`);
    if (rows.length >= 6) return setErr('Wordle only has 6 guesses.');
    setErr(''); setRows([...rows, { word: w, res: [0, 0, 0, 0, 0] }]); setDraft('');
  };
  const cycle = (r: number, i: number) => setRows(rows.map((row, ri) => (ri === r ? { ...row, res: row.res.map((c, ci) => (ci === i ? (((c + 1) % 3) as Cell) : c)) } : row)));

  const matches = useMemo(() => {
    if (!rows.length) return [];
    return ALL.filter((w) => rows.every((r) => scoreGuess(r.word, w).every((c, i) => c === r.res[i])));
  }, [rows]);

  // Rank what's left: words made of letters that are common among the remaining candidates, common words first.
  const ranked = useMemo(() => {
    if (!rows.length) return [];
    const freq = new Map<string, number>();
    const pos = Array.from({ length: 5 }, () => new Map<string, number>());
    for (const w of matches) {
      for (const ch of new Set(w)) freq.set(ch, (freq.get(ch) || 0) + 1);
      for (let i = 0; i < 5; i++) pos[i].set(w[i], (pos[i].get(w[i]) || 0) + 1);
    }
    const sc = (w: string) => {
      let s = 0;
      for (const ch of new Set(w)) s += freq.get(ch) || 0;
      for (let i = 0; i < 5; i++) s += (pos[i].get(w[i]) || 0) * 0.6;
      return s + (COMMON.has(w) ? matches.length * 2 : 0);
    };
    return [...matches].sort((a, b) => sc(b) - sc(a));
  }, [matches, rows.length]);

  const list = showAll ? ranked : ranked.slice(0, 48);

  return (
    <section className="helper card" aria-label="Interactive Wordle helper">
      <div className="helper-head">
        <h2>Wordle helper</h2>
        <p>Type the word you played, then <strong>tap each tile</strong> until it matches your board: grey, yellow or green.</p>
      </div>

      <div className="helper-rows">
        {rows.map((row, r) => (
          <div className="helper-row" key={r}>
            {row.word.split('').map((ch, i) => (
              <button key={i} type="button" className={`helper-tile s${row.res[i]}`} onClick={() => cycle(r, i)} aria-label={`${ch.toUpperCase()}, ${LABEL[row.res[i]]}. Tap to change`}>{ch}</button>
            ))}
          </div>
        ))}
        {rows.length < 6 && (
          <form className="helper-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input value={draft} onChange={(e) => { setDraft(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 5)); setErr(''); }} placeholder="Type your guess" aria-label="Your guess" autoComplete="off" spellCheck={false} maxLength={5} />
            <button type="submit" className="btn btn-primary">Add guess</button>
          </form>
        )}
        {err && <p className="helper-err" role="alert">{err}</p>}
      </div>

      <div className="helper-actions">
        <button type="button" className="chip-btn" disabled={!rows.length} onClick={() => setRows(rows.slice(0, -1))}>Undo last</button>
        <button type="button" className="chip-btn" disabled={!rows.length} onClick={() => { setRows([]); setShowAll(false); }}>Start over</button>
      </div>

      {rows.length > 0 && (
        <div className="helper-out" aria-live="polite">
          <p className="helper-count"><strong>{matches.length}</strong> {matches.length === 1 ? 'word fits' : 'words fit'} your clues</p>
          {matches.length === 0 && <p className="helper-err">No match. Check that every tile colour matches your board.</p>}
          {ranked.length > 0 && <p className="helper-sub">Best next guesses first. <span className="dot" /> marks a common word.</p>}
          <ul className="helper-words">
            {list.map((w) => <li key={w} className={COMMON.has(w) ? 'common' : ''}>{w}</li>)}
          </ul>
          {ranked.length > 48 && <button type="button" className="chip-btn" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show fewer' : `Show all ${ranked.length}`}</button>}
        </div>
      )}
      {rows.length === 0 && <p className="helper-empty">Not sure where to start? Try <strong>CRANE</strong>, <strong>SLATE</strong> or <strong>ADIEU</strong>.</p>}
    </section>
  );
}
