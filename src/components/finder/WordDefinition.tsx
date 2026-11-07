import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Entry = { pos: string; defs: string[] };
type State = { status: 'loading' } | { status: 'ready'; entries: Entry[] } | { status: 'empty' } | { status: 'error' };

const memory = new Map<string, Entry[]>();

function plain(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('style,sup,.citation-whole').forEach((n) => n.remove());
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

async function loadEntries(word: string, signal: AbortSignal): Promise<Entry[]> {
  const cached = memory.get(word);
  if (cached) return cached;
  try { const s = sessionStorage.getItem('lw:def:' + word); if (s) { const e = JSON.parse(s) as Entry[]; memory.set(word, e); return e; } } catch { /* ignore */ }
  const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`, { signal, headers: { Accept: 'application/json' } });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error('definition request failed');
  const json = await res.json();
  const entries: Entry[] = [];
  for (const block of (json.en || []) as { partOfSpeech?: string; definitions?: { definition?: string }[] }[]) {
    const defs = (block.definitions || []).map((d) => plain(d.definition || '')).filter(Boolean).slice(0, 3);
    if (defs.length) entries.push({ pos: (block.partOfSpeech || '').toLowerCase(), defs });
  }
  const out = entries.slice(0, 4);
  memory.set(word, out);
  try { sessionStorage.setItem('lw:def:' + word, JSON.stringify(out)); } catch { /* ignore */ }
  return out;
}

type Props = { word: string; onClose: () => void; onCopy: (word: string, shown: string) => Promise<void> | void };

export default function WordDefinition({ word, onClose, onCopy }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<number>(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    loadEntries(word, ctrl.signal)
      .then((entries) => setState(entries.length ? { status: 'ready', entries } : { status: 'empty' }))
      .catch((err) => { if (err?.name !== 'AbortError') setState({ status: 'error' }); });
    return () => ctrl.abort();
  }, [word, attempt]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; window.clearTimeout(copyTimer.current); opener?.focus?.(); };
  }, [onClose]);

  const copy = useCallback(async () => {
    await onCopy(word, word.toUpperCase());
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
  }, [onCopy, word]);

  const wikiUrl = `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`;

  return createPortal(
    <div className="def-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="def-modal" role="dialog" aria-modal="true" aria-labelledby="def-title">
        <div className="def-head">
          <h2 id="def-title">Word Definition <span className="def-new">New</span></h2>
          <button ref={closeRef} type="button" className="def-close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="def-body">
          <div className="def-word">
            <span>{word.toUpperCase()}</span>
            <button type="button" className="def-copy" onClick={copy} aria-label={`Copy ${word.toUpperCase()}`}>{copied ? 'Copied ✓' : 'Copy'}</button>
          </div>
          <div aria-live="polite">
            {state.status === 'loading' && <div className="def-card def-muted">Loading definition…</div>}
            {state.status === 'ready' && state.entries.map((e, i) => (
              <div className="def-card" key={i}>
                {e.pos && <em className="def-pos">{e.pos}</em>}
                {e.defs.length === 1 ? <p>{e.defs[0]}</p> : <ol>{e.defs.map((d, k) => <li key={k}>{d}</li>)}</ol>}
              </div>
            ))}
            {state.status === 'empty' && <div className="def-card def-muted">No definition found for “{word}”. Some Scrabble-only words and proper names aren’t in Wiktionary.</div>}
            {state.status === 'error' && <div className="def-card def-muted">Couldn’t load the definition. <button type="button" className="def-retry" onClick={() => setAttempt((n) => n + 1)}>Try again</button></div>}
          </div>
          <p className="def-source">Source: <a href={wikiUrl} target="_blank" rel="noopener noreferrer">Wiktionary</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> · Modified</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
