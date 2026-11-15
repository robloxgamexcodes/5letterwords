import { useEffect, useMemo, useState } from 'react';
import { parseLengthData, type LengthData } from '../../lib/dictionaries';
import { score } from '../../lib/scoring';
import WordGrid from './WordGrid';

const clean = (v: string) => v.toLowerCase().replace(/[^a-z?_.*\- ]/g, '').replace(/[_.*\- ]/g, '?').slice(0, 7);
const EXAMPLES = ['c?t', 's??re', '?o?e?', 'b?a??e', 'p??t??n'];

export default function CrosswordSolver() {
  const [pattern, setPattern] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [mustHave, setMustHave] = useState('');
  const [data, setData] = useState<Record<number, LengthData>>({});
  const [loading, setLoading] = useState(false);

  const len = submitted.length;
  useEffect(() => {
    if (len < 3 || len > 7 || data[len]) return;
    setLoading(true);
    fetch(`/data/words/${len}.json`).then((r) => r.json()).then((raw) => setData((d) => ({ ...d, [len]: parseLengthData(raw) }))).catch(() => {}).finally(() => setLoading(false));
  }, [len, data]);

  const results = useMemo(() => {
    const d = data[len];
    if (!d || !submitted) return [];
    const re = new RegExp('^' + submitted.replace(/\?/g, '.') + '$');
    const must = [...new Set(mustHave.toLowerCase().replace(/[^a-z]/g, ''))];
    return d.words.filter((w) => re.test(w) && must.every((c) => w.includes(c))).map((w) => ({ word: w, pts: score(w) }));
  }, [data, len, submitted, mustHave]);

  const run = () => { if (pattern.length >= 3) setSubmitted(pattern); };
  const bad = submitted && (len < 3 || len > 7);

  return (
    <div className="xw">
      <div className="xw-head">
        <h2>Crossword solver</h2>
        <p>Type the letters you have and use <b>?</b> for each missing one. <span>Example: <button type="button" onClick={() => { setPattern('c?t'); setSubmitted('c?t'); }}>c?t</button> finds cat, cot, cut…</span></p>
      </div>
      <div className="xw-form">
        <input className="xw-input" value={pattern} onChange={(e) => setPattern(clean(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && run()} placeholder="e.g. s??re" aria-label="Crossword pattern" autoComplete="off" spellCheck={false} />
        <input className="xw-must" value={mustHave} onChange={(e) => setMustHave(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 7))} placeholder="Must also contain (optional)" aria-label="Letters the answer must contain" autoComplete="off" />
        <button type="button" className="btn btn-primary" onClick={run} disabled={pattern.length < 3}>Find words</button>
      </div>
      <div className="xw-preview" aria-hidden="true">
        {(pattern || '?????').split('').map((c, i) => <span key={i} className={c === '?' ? 'blank' : 'known'}>{c === '?' ? '' : c}</span>)}
      </div>
      <p className="xw-ex">Try: {EXAMPLES.map((e) => <button key={e} type="button" onClick={() => { setPattern(e); setSubmitted(e); }}>{e}</button>)}</p>
      {bad && <p className="helper-err">Patterns work for 3 to 7 letters.</p>}
      {loading && <p className="xw-status">Loading words…</p>}
      {!!submitted && !bad && !loading && (
        <div className="xw-results">
          <p className="xw-status"><strong>{results.length}</strong> {results.length === 1 ? 'word matches' : 'words match'} <code>{submitted}</code></p>
          {results.length > 0 && <WordGrid items={results} showPoints />}
        </div>
      )}
    </div>
  );
}
