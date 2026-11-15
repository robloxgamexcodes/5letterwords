import { useEffect, useState } from 'react';
import { dayLabel, wordOfTheDay } from '../../lib/game';

type Entry = { pos: string; defs: string[] };
const plain = (html: string) => { const d = new DOMParser().parseFromString(html, 'text/html'); d.querySelectorAll('style,sup').forEach((n) => n.remove()); return (d.body.textContent || '').replace(/\s+/g, ' ').trim(); };

async function define(word: string): Promise<Entry | null> {
  try { const s = sessionStorage.getItem('lw:def:' + word); if (s) { const e = JSON.parse(s) as Entry[]; return e[0] || null; } } catch { /* ignore */ }
  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    const entries: Entry[] = [];
    for (const b of (json.en || []) as { partOfSpeech?: string; definitions?: { definition?: string }[] }[]) {
      const defs = (b.definitions || []).map((d) => plain(d.definition || '')).filter(Boolean).slice(0, 3);
      if (defs.length) entries.push({ pos: (b.partOfSpeech || '').toLowerCase(), defs });
    }
    try { sessionStorage.setItem('lw:def:' + word, JSON.stringify(entries.slice(0, 4))); } catch { /* ignore */ }
    return entries[0] || null;
  } catch { return null; }
}

export default function DailyStrip() {
  const word = wordOfTheDay();
  const [def, setDef] = useState<Entry | null>(null);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState<'new' | 'progress' | 'done'>('new');
  const [tries, setTries] = useState(0);

  useEffect(() => {
    define(word).then(setDef);
    try {
      const st = JSON.parse(localStorage.getItem('5lw:stats:wordle') || 'null'); if (st?.streak) setStreak(st.streak);
      const sv = JSON.parse(localStorage.getItem('5lw:game:wordle:daily') || 'null');
      if (sv && sv.day === dayLabel() && sv.guesses?.length) { setTries(sv.guesses.length); setStatus('progress'); }
    } catch { /* ignore */ }
  }, [word]);

  const dateText = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <section className="daily" aria-label="Today on the site">
      <a className="daily-card daily-play" href="/wordle">
        <span className="daily-eyebrow">{dateText}</span>
        <strong>Today’s Wordle</strong>
        <span className="mini-tiles" aria-hidden="true"><i className="g">P</i><i className="y">L</i><i>A</i><i className="g">Y</i><i className="y">!</i></span>
        <span className="daily-sub">{status === 'progress' ? `You’re ${tries} guess${tries === 1 ? '' : 'es'} in. Keep going` : 'Free daily puzzle. Six tries.'}</span>
        <span className="daily-cta">{status === 'progress' ? 'Continue' : 'Play now'} <b>→</b>{streak > 0 && <em>🔥 {streak}-day streak</em>}</span>
      </a>

      <div className="daily-card daily-wotd">
        <span className="daily-eyebrow">Word of the day</span>
        <span className="wotd-word" aria-label={word}>{word.split('').map((c, i) => <i key={i} style={{ animationDelay: `${i * 90}ms` }}>{c}</i>)}</span>
        <p className="wotd-def">{def ? <><em>{def.pos}</em> {def.defs[0]}</> : 'Tap below to see what it means.'}</p>
        <a className="daily-link" href={`https://en.wiktionary.org/wiki/${word}`} target="_blank" rel="noopener noreferrer">Full definition →</a>
      </div>

      <div className="daily-card daily-more">
        <span className="daily-eyebrow">More ways to play</span>
        <ul>
          <li><a href="/quordle"><b>Quordle</b><span>4 boards, 9 guesses</span></a></li>
          <li><a href="/dordle"><b>Dordle</b><span>2 boards, 7 guesses</span></a></li>
          <li><a href="/wordle-solver"><b>Wordle Solver</b><span>Stuck? Get unstuck</span></a></li>
        </ul>
      </div>
    </section>
  );
}
