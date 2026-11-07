import { useEffect, useMemo, useState } from 'react';
import { DICTIONARY_LABELS, parseLengthData, type LengthData } from '../../lib/dictionaries';
import { score, type ScoreGame } from '../../lib/scoring';
import WordGrid from './WordGrid';
import { SETTINGS_EVENT, loadSettings, type Settings } from '../../lib/settings';

type Mode = 'unscramble' | 'anagram' | 'scramble';
type Props = { mode: Mode; dictionaries: string[] };

const LENGTHS = [3, 4, 5, 6, 7];
const cleanTiles = (v: string) => v.toLowerCase().replace(/[^a-z?* ]/g, '').slice(0, 15);
const cleanLetters = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '').slice(0, 7);
const cleanContains = (v: string) => v.toLowerCase().replace(/[^a-z_]/g, '').slice(0, 7);

const CTA: Record<Mode, string> = { unscramble: 'Unscramble', anagram: 'Find anagrams', scramble: 'Solve' };

export default function Unscrambler({ mode, dictionaries }: Props) {
  const [tiles, setTiles] = useState('');
  const [game, setGame] = useState<ScoreGame>('scrabble');
  const [dictKey, setDictKey] = useState('all');
  const [starts, setStarts] = useState('');
  const [ends, setEnds] = useState('');
  const [contains, setContains] = useState('');
  const [length, setLength] = useState<'any' | number>('any');
  const [submitted, setSubmitted] = useState('');
  const [data, setData] = useState<Record<number, LengthData> | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    const onChange = (e: Event) => setSettings((e as CustomEvent<Settings>).detail);
    window.addEventListener(SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(SETTINGS_EVENT, onChange);
  }, []);

  // Load the dictionaries lazily, the first time someone asks for a result.
  useEffect(() => {
    if (!submitted || data) return;
    Promise.all(LENGTHS.map((n) => fetch(`/data/words/${n}.json`).then((r) => r.json())))
      .then((all) => setData(Object.fromEntries(all.map((raw, i) => [LENGTHS[i], parseLengthData(raw)]))))
      .catch(() => setData({}));
  }, [submitted, data]);

  const groups = useMemo(() => {
    if (!submitted || !data) return null;
    const letters = [...submitted.replace(/ /g, '?')];
    const blanks = letters.filter((c) => c === '?' || c === '*').length;
    const counts = new Map<string, number>();
    for (const c of letters) if (c !== '?' && c !== '*') counts.set(c, (counts.get(c) || 0) + 1);
    const n = letters.length;
    const s = cleanLetters(starts), e = cleanLetters(ends), c = cleanContains(contains);

    const containsOk = (w: string) => {
      if (!c) return true;
      for (let off = 0; off + c.length <= w.length; off++) {
        let ok = true;
        for (let j = 0; j < c.length; j++) if (c[j] !== '_' && w[off + j] !== c[j]) { ok = false; break; }
        if (ok) return true;
      }
      return false;
    };
    const buildable = (w: string) => {
      const seen = new Map<string, number>();
      let deficit = 0;
      for (const ch of w) {
        const k = (seen.get(ch) || 0) + 1;
        seen.set(ch, k);
        if (k > (counts.get(ch) || 0) && ++deficit > blanks) return false;
      }
      return true;
    };

    const out = new Map<number, { word: string; pts: number }[]>();
    for (const len of LENGTHS) {
      const d = data[len];
      if (!d) continue;
      if (length !== 'any' && length !== len) continue;
      if (len > n) continue;
      if (mode !== 'unscramble' && len !== n) continue; // anagram / scramble use every tile
      const set = dictKey !== 'all' ? d.sets[dictKey] : null;
      const list: { word: string; pts: number }[] = [];
      d.words.forEach((w, i) => {
        if (set && !set.has(i)) return;
        if (s && !w.startsWith(s)) return;
        if (e && !w.endsWith(e)) return;
        if (!containsOk(w)) return;
        if (!buildable(w)) return;
        list.push({ word: w, pts: score(w, game) });
      });
      list.sort((a, b) => b.pts - a.pts || a.word.localeCompare(b.word));
      if (list.length) out.set(len, list);
    }
    // anagram/scramble: longest first; unscramble: longest first as well
    return [...out].sort(([a], [b]) => b - a);
  }, [submitted, data, starts, ends, contains, length, dictKey, game, mode]);

  const total = groups?.reduce((sum, [, l]) => sum + l.length, 0) ?? 0;
  const showPoints = settings ? settings.scores : true;
  const run = () => { if (tiles.trim()) setSubmitted(tiles.trim().toLowerCase()); };

  return (
    <div className="finder">
      <section className="solver card" aria-label="Word unscrambler">
        <div className="tabs" role="tablist" aria-label="Scoring">
          {([['scrabble', 'Scrabble'], ['wwf', 'Words With Friends']] as const).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={game === k} className={`tab ${game === k ? 'on' : ''}`} onClick={() => setGame(k)} type="button">{label}</button>
          ))}
        </div>

        <label className="field field-wide">
          <span className="sr-only">Your letters</span>
          <input
            className="tiles-input" value={tiles} placeholder="Type your letters (? for a blank)"
            onChange={(e) => setTiles(cleanTiles(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && run()} autoComplete="off" spellCheck={false} aria-label="Your letters"
          />
        </label>

        {dictionaries.length > 1 && (
          <label className="field"><span>Dictionary</span>
            <select value={dictKey} onChange={(e) => setDictKey(e.target.value)}>
              {dictionaries.map((k) => <option key={k} value={k}>{DICTIONARY_LABELS[k]}</option>)}
            </select>
          </label>
        )}

        <div className="more-grid">
          <label className="field"><span>Starts with</span><input value={starts} onChange={(e) => setStarts(cleanLetters(e.target.value))} autoComplete="off" /></label>
          <label className="field"><span>Ends with</span><input value={ends} onChange={(e) => setEnds(cleanLetters(e.target.value))} autoComplete="off" /></label>
          <label className="field"><span>Contains</span><input value={contains} onChange={(e) => setContains(cleanContains(e.target.value))} autoComplete="off" /></label>
          <label className="field"><span>Length</span>
            <select value={String(length)} onChange={(e) => setLength(e.target.value === 'any' ? 'any' : Number(e.target.value))}>
              <option value="any">Any</option>
              {LENGTHS.map((n) => <option key={n} value={n}>{n} letters</option>)}
            </select>
          </label>
          <p className="field-help">In <strong>Contains</strong>, use <strong>_</strong> for a gap: <strong>E_O</strong> finds l<mark>emo</mark>n.{dictionaries.length > 1 && ' Pick a Dictionary above to keep only words that game accepts.'}</p>
        </div>

        <div className="solver-actions">
          <button type="button" className="btn btn-ghost" onClick={() => { setTiles(''); setStarts(''); setEnds(''); setContains(''); setLength('any'); setDictKey('all'); setSubmitted(''); }}>Clear</button>
          <button type="button" className="btn btn-primary" onClick={run}>{CTA[mode]}</button>
          <span className="load-note" aria-live="polite">{submitted && !data ? 'Loading dictionary…' : ''}</span>
        </div>
      </section>

      {submitted && groups && (
        <section className="results card" aria-label="Results">
          <div className="results-head"><h3 aria-live="polite">{total === 1 ? '1 word' : `${total.toLocaleString('en-US')} words`}</h3></div>
          {groups.length === 0 && <p className="empty">No words found. Try different letters or loosen a filter.</p>}
          {groups.map(([len, list]) => (
            <div key={len} className="group">
              <h4>{len} letter words <span>{list.length}</span></h4>
              <WordGrid items={list} uppercase={settings?.uppercase} showPoints={showPoints} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
