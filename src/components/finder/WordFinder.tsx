import { useEffect, useMemo, useRef, useState } from 'react';
import { DICTIONARY_LABELS, parseLengthData, type LengthData } from '../../lib/dictionaries';
import { clean, cleanRack, cleanRun, compile, hasActiveFilter, matchesBase, type Base } from '../../lib/filter';
import { score } from '../../lib/scoring';
import WordGrid from './WordGrid';
import { DEFAULT_SETTINGS, SETTINGS_EVENT, loadSettings, saveSettings, type Settings } from '../../lib/settings';

type Props = {
  len: number;
  base?: Base;
  initialWords: string[];
  initialCount: number;
  statusLabel: string; // "Sample" on finder pages, "All words" on list pages
  showMoreInitially: boolean;
  pageSize: number;
  dictionaries: string[];
  defaultDictionary?: string;
  /** A sample "letter run" pattern with a few real matches, e.g. { pattern: 'S_ARE', hits: ['spare', 'share'] } */
  example?: { pattern: string; hits: string[] };
};

const HELP = {
  right: { title: 'Right spot', sub: 'Correct letter, correct place', tile: 'a green Wordle tile', body: 'Type a letter into the slot you already know it sits in. Only words with that exact letter in that exact slot come back.' },
  wrong: { title: 'Wrong spot', sub: 'In the word, wrong place', tile: 'a yellow Wordle tile', body: 'For letters you know are in the answer but cannot place yet. Every word that comes back contains all of them, wherever they land.' },
  dead: { title: 'Not in the word', sub: 'Letters to rule out', tile: 'a grey Wordle tile', body: 'Your dead letters. Any word holding one of these gets dropped from the results.', extra: 'If a letter here also appears in Right spot or Wrong spot above, only the spare copies are dropped — the ones you placed still count.' },
} as const;

const OPTIONS: { key: keyof Settings; label: string; hint: string }[] = [
  { key: 'scores', label: 'Scrabble scores', hint: 'Show each word’s point value' },
  { key: 'bestFirst', label: 'Best first', hint: 'Highest scoring words at the top' },
  { key: 'uppercase', label: 'Uppercase', hint: 'Show results in capitals' },
  { key: 'colours', label: 'Wordle colours', hint: 'Tint the letters you matched' },
  { key: 'repeats', label: 'Count repeats', hint: 'Treat a letter as appearing more than once' },
  { key: 'contrast', label: 'High contrast', hint: 'Stronger borders and separators' },
  { key: 'dark', label: 'Dark mode', hint: 'Easier on the eyes at night' },
];

const blank = (n: number) => Array.from({ length: n }, () => '');

function TileRow({ kind, count, values, onChange, label }: {
  kind: 'right' | 'wrong' | 'dead'; count: number; values: string[]; onChange: (v: string[]) => void; label: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);
  const help = HELP[kind];
  const focus = (i: number) => refs.current[Math.max(0, Math.min(count - 1, i))]?.focus();

  const write = (start: number, letters: string) => {
    const next = [...values];
    let i = start;
    for (const ch of letters) { if (i >= count) break; next[i++] = ch; }
    onChange(next);
    focus(Math.min(i, count - 1));
  };

  return (
    <div className={`tile-row tile-row-${kind}`}>
      <div className="tile-row-head">
        <div>
          <p className="tile-title">{help.title}</p>
          <p>{help.sub}</p>
        </div>
        <button type="button" className="info-btn" aria-expanded={helpOpen} aria-label={`About ${help.title}`} onClick={() => setHelpOpen((v) => !v)}>i</button>
      </div>
      {helpOpen && (
        <div className="info-pop" role="note">
          <strong>{help.title}</strong>
          <span className="info-tile">{help.sub} — {help.tile}</span>
          <p>{help.body}</p>
          {'extra' in help && <p>{help.extra}</p>}
        </div>
      )}
      <div className={`tiles ${kind === 'dead' ? 'tiles-many' : ''}`}>
        {Array.from({ length: count }, (_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`tile tile-${kind}`}
            value={(values[i] || '').toUpperCase()}
            inputMode="text" maxLength={2} autoComplete="off" autoCapitalize="characters" spellCheck={false}
            placeholder={String(i + 1)}
            aria-label={`${label} — slot ${i + 1}`}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const letters = clean(e.target.value);
              if (!letters) { const next = [...values]; next[i] = ''; onChange(next); return; }
              write(i, letters.length > 1 && e.target.value.length > 2 ? letters : letters.slice(-1));
            }}
            onPaste={(e) => { e.preventDefault(); write(i, clean(e.clipboardData.getData('text'))); }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !values[i]) { e.preventDefault(); const next = [...values]; if (i > 0) next[i - 1] = ''; onChange(next); focus(i - 1); }
              if (e.key === 'ArrowLeft') focus(i - 1);
              if (e.key === 'ArrowRight') focus(i + 1);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WordFinder(props: Props) {
  const { len, base = null, initialWords, initialCount, statusLabel, pageSize, dictionaries, defaultDictionary = 'all', example } = props;

  const [data, setData] = useState<LengthData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(true);
  const [searched, setSearched] = useState(false);
  const [visible, setVisible] = useState(pageSize);

  const [right, setRight] = useState(blank(len));
  const [wrong, setWrong] = useState(blank(len));
  const [dead, setDead] = useState(blank(20));
  const [begins, setBegins] = useState('');
  const [ends, setEnds] = useState('');
  const [run, setRun] = useState('');
  const [rack, setRack] = useState('');
  const [only, setOnly] = useState('');
  const [dictKey, setDictKey] = useState(defaultDictionary);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
    const onChange = (e: Event) => setSettings((e as CustomEvent<Settings>).detail);
    window.addEventListener(SETTINGS_EVENT, onChange);
    return () => window.removeEventListener(SETTINGS_EVENT, onChange);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/data/words/${len}.json`)
      .then((r) => r.json())
      .then((raw) => alive && setData(parseLengthData(raw)))
      .catch(() => alive && setLoadError(true));
    return () => { alive = false; };
  }, [len]);

  const toggle = (key: keyof Settings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveSettings(next);
  };

  const query = { len, right, wrong, dead, begins, ends, run, rack, only, repeats: settings.repeats };
  const active = hasActiveFilter(query) || searched;

  const pool = useMemo(() => {
    if (!data) return null;
    const set = dictKey !== 'all' ? data.sets[dictKey] : null;
    const head: string[] = [];
    const tail: string[] = [];
    // Everyday words first, then the rest, so likely answers lead the list.
    data.words.forEach((w, i) => { if ((!set || set.has(i)) && matchesBase(w, base)) (data.common.has(i) ? head : tail).push(w); });
    return head.concat(tail);
  }, [data, dictKey, base]);

  const matches = useMemo(() => {
    if (!pool) return null;
    const test = compile(query);
    const list = pool.filter(test);
    if (settings.bestFirst) list.sort((a, b) => score(b) - score(a) || a.localeCompare(b));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, right, wrong, dead, begins, ends, run, rack, only, settings.repeats, settings.bestFirst]);

  useEffect(() => setVisible(pageSize), [right, wrong, dead, begins, ends, run, rack, only, dictKey, searched, pageSize]);

  // What to show: SSR sample until the dictionary arrives, then live results.
  let words: string[]; let total: number; let label: string;
  if (!matches || !pool) {
    words = initialWords; total = initialCount; label = `${statusLabel} · ${initialCount.toLocaleString('en-US')}`;
  } else if (!active) {
    const browse = settings.bestFirst ? [...pool].sort((a, b) => score(b) - score(a) || a.localeCompare(b)) : pool;
    words = browse; total = pool.length;
    label = props.showMoreInitially ? `${statusLabel} · ${pool.length.toLocaleString('en-US')}` : `${statusLabel} · ${Math.min(pageSize, pool.length)}`;
  } else {
    words = matches; total = matches.length;
    label = total === 1 ? '1 word' : `${total.toLocaleString('en-US')} words`;
  }
  const sample = !active && !props.showMoreInitially;
  const shown = sample ? words.slice(0, pageSize) : words.slice(0, visible);
  const remaining = sample ? 0 : Math.max(0, (matches && active ? total : words.length) - shown.length);

  const clearAll = () => {
    setRight(blank(len)); setWrong(blank(len)); setDead(blank(20));
    setBegins(''); setEnds(''); setRun(''); setRack(''); setOnly('');
    setDictKey(defaultDictionary); setSearched(false);
  };
  const search = () => { setSearched(true); resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const tint = (word: string, i: number) => {
    if (!settings.colours) return '';
    if (right[i] && right[i] === word[i]) return 'ok';
    if (wrong.includes(word[i]) && wrong[i] !== word[i]) return 'near';
    return '';
  };

  return (
    <div className="finder">
      <section className="solver card" aria-label={`${len} letter word solver`}>
        <h2 className="solver-title">Letter &amp; Word Solver</h2>
        <TileRow kind="right" count={len} values={right} onChange={setRight} label="Right spot" />
        <TileRow kind="wrong" count={len} values={wrong} onChange={setWrong} label="Wrong spot" />
        <TileRow kind="dead" count={20} values={dead} onChange={setDead} label="Not in the word" />

        <div className="more-head">
          <p className="more-title">More filters</p>
          <button type="button" className="link-btn" aria-expanded={moreOpen} onClick={() => setMoreOpen((v) => !v)}>{moreOpen ? 'Hide' : 'Show'}</button>
        </div>
        {moreOpen && (
          <div className="more-grid">
            <label className="field"><span>Begins with</span><input value={begins} maxLength={len} onChange={(e) => setBegins(clean(e.target.value, len))} autoComplete="off" /></label>
            <label className="field"><span>Ends with</span><input value={ends} maxLength={len} onChange={(e) => setEnds(clean(e.target.value, len))} autoComplete="off" /></label>
            <label className="field"><span>Letter run</span><input value={run} maxLength={len} onChange={(e) => setRun(cleanRun(e.target.value, len))} autoComplete="off" /></label>
            <label className="field"><span>Your rack</span><input value={rack} maxLength={20} onChange={(e) => setRack(cleanRack(e.target.value))} autoComplete="off" /></label>
            <label className="field"><span>Built only from these letters</span><input value={only} maxLength={26} onChange={(e) => setOnly(clean(e.target.value, 26))} autoComplete="off" /></label>
            {dictionaries.length > 1 && (
              <label className="field"><span>Dictionary</span>
                <select value={dictKey} onChange={(e) => setDictKey(e.target.value)}>
                  {dictionaries.map((k) => <option key={k} value={k}>{DICTIONARY_LABELS[k]}</option>)}
                </select>
              </label>
            )}
            <p className="field-help">
              Letter run takes <strong>_</strong> as a one-letter gap{example ? <>, so <strong>{example.pattern.toUpperCase()}</strong> finds <mark>{example.hits.join(', ')}</mark> and more</> : null}.
              {dictionaries.length > 1 && ' Dictionary keeps only the words your game accepts.'}
            </p>
          </div>
        )}

        <div className="solver-actions">
          <button type="button" className="btn btn-ghost" onClick={clearAll}>Clear</button>
          <button type="button" className="btn btn-primary" onClick={search} disabled={!data && !loadError}>Search</button>
          <span className="load-note" aria-live="polite">{loadError ? 'Could not load the dictionary.' : !data ? 'Loading dictionary…' : ''}</span>
        </div>
      </section>

      <section className="results card" ref={resultsRef} aria-label="Matching words">
        <div className="results-head">
          <p className="results-title" role="status" aria-live="polite">{label.includes(' · ') ? <>{label.split(' · ')[0]}<span className="count"> · {label.split(' · ')[1]}</span></> : label}</p>
          <button type="button" className="link-btn" aria-haspopup="dialog" aria-expanded={panelOpen} onClick={() => setPanelOpen(true)}>Display options</button>
        </div>

        {panelOpen && (
          <div className="panel-backdrop" onClick={() => setPanelOpen(false)}>
            <div className="panel" role="dialog" aria-modal="true" aria-label="Display options" onClick={(e) => e.stopPropagation()}>
              <div className="panel-head"><h2 className="panel-title">Display options</h2><p>How the matching words are shown.</p></div>
              <ul>
                {OPTIONS.map((o) => (
                  <li key={o.key}>
                    <label className="option">
                      <span className="option-text"><strong>{o.label}</strong><small>{o.hint}</small></span>
                      <input type="checkbox" checked={settings[o.key]} onChange={() => toggle(o.key)} aria-label={`${o.label} / ${settings[o.key] ? 'ON' : 'OFF'}`} />
                      <span className="switch" aria-hidden="true" />
                      <span className="option-state">{settings[o.key] ? 'ON' : 'OFF'}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-primary panel-done" onClick={() => setPanelOpen(false)}>Done</button>
            </div>
          </div>
        )}

        {shown.length ? (
          <WordGrid items={shown.map((word) => ({ word, pts: score(word) }))} uppercase={settings.uppercase} showPoints={settings.scores} tint={settings.colours ? tint : undefined} />
        ) : (
          <p className="empty">No words match those clues. Try removing a letter or a filter.</p>
        )}
        {remaining > 0 && (
          <button type="button" className="btn btn-more" onClick={() => setVisible((v) => v + 200)}>
            Show More ({remaining.toLocaleString('en-US')} more)
          </button>
        )}
      </section>
    </div>
  );
}
