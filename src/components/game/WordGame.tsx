import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KEYBOARD, VALID, dailyAnswers, dayLabel, dayNumber, loadStats, randomAnswers, saveStats, scoreGuess, type Cell, type Stats } from '../../lib/game';

type Props = { slug: string; boards: 1 | 2 | 4; maxGuesses: number; title: string };
type Saved = { day: string; guesses: string[] };

const EMOJI = ['⬛', '🟨', '🟩'];

export default function WordGame({ slug, boards, maxGuesses, title }: Props) {
  const [mode, setMode] = useState<'daily' | 'unlimited'>('daily');
  const [answers, setAnswers] = useState<string[]>(() => dailyAnswers(boards));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<Stats>(() => loadStats(slug, maxGuesses));
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const countedRef = useRef(false);
  const saveKey = `5lw:game:${slug}:daily`;
  const today = dayLabel();

  // restore today's daily progress
  useEffect(() => {
    try {
      const s: Saved | null = JSON.parse(localStorage.getItem(saveKey) || 'null');
      if (s && s.day === today) { setGuesses(s.guesses); countedRef.current = true; }
    } catch { /* ignore */ }
  }, [saveKey, today]);

  // board i is solved at guess index solvedAt[i] (or -1)
  const solvedAt = useMemo(() => answers.map((a) => guesses.indexOf(a)), [answers, guesses]);
  const won = solvedAt.every((i) => i >= 0);
  const lost = !won && guesses.length >= maxGuesses;
  const over = won || lost;

  useEffect(() => {
    if (mode === 'daily') { try { localStorage.setItem(saveKey, JSON.stringify({ day: today, guesses })); } catch { /* ignore */ } }
  }, [guesses, mode, saveKey, today]);

  // finish: update stats once, then open the results dialog
  useEffect(() => {
    if (!over) return;
    const t = setTimeout(() => setShowStats(true), 1400);
    if (mode === 'daily' && !countedRef.current) {
      countedRef.current = true;
      const day = dayNumber();
      const s = { ...stats, dist: [...stats.dist] };
      s.played++;
      if (won) { s.won++; s.streak = s.lastDay === day - 1 || s.lastDay === day ? s.streak + 1 : 1; s.best = Math.max(s.best, s.streak); s.dist[Math.min(guesses.length, maxGuesses) - 1]++; }
      else s.streak = 0;
      s.lastDay = day;
      setStats(s); saveStats(slug, s);
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 1600); };

  const submit = useCallback(() => {
    if (current.length < 5) { setShake(true); setTimeout(() => setShake(false), 450); return flash('Not enough letters'); }
    if (!VALID.has(current)) { setShake(true); setTimeout(() => setShake(false), 450); return flash('Not in word list'); }
    if (guesses.includes(current)) return flash('Already guessed');
    setGuesses((g) => [...g, current]); setCurrent('');
  }, [current, guesses]);

  const press = useCallback((k: string) => {
    if (over) return;
    if (k === 'enter') submit();
    else if (k === 'back') setCurrent((c) => c.slice(0, -1));
    else if (/^[a-z]$/.test(k)) setCurrent((c) => (c.length < 5 ? c + k : c));
  }, [over, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if (e.key === 'Enter') { if (t?.tagName === 'BUTTON') return; e.preventDefault(); press('enter'); }
      else if (e.key === 'Backspace') press('back');
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const newGame = (m: 'daily' | 'unlimited') => {
    setMode(m); setCurrent(''); setShowStats(false); setCopied(false);
    if (m === 'daily') {
      setAnswers(dailyAnswers(boards));
      try {
        const s: Saved | null = JSON.parse(localStorage.getItem(saveKey) || 'null');
        const same = !!(s && s.day === today);
        setGuesses(same ? s!.guesses : []);
        countedRef.current = same;
      } catch { setGuesses([]); countedRef.current = false; }
    } else { setAnswers(randomAnswers(boards)); setGuesses([]); }
  };

  // key colours: best state per board, shown as colour bars when there are several boards
  const keyState = useMemo(() => {
    const m: Record<string, number[]> = {};
    answers.forEach((a, b) => {
      const limit = solvedAt[b] >= 0 ? solvedAt[b] + 1 : guesses.length;
      for (let gi = 0; gi < limit; gi++) {
        const g = guesses[gi]; const r = scoreGuess(g, a);
        for (let i = 0; i < 5; i++) {
          m[g[i]] ||= Array(boards).fill(-1);
          if (r[i] > m[g[i]][b]) m[g[i]][b] = r[i];
        }
      }
    });
    return m;
  }, [answers, guesses, solvedAt, boards]);

  const keyStyle = (k: string) => {
    const st = keyState[k]; if (!st) return undefined;
    const col = (v: number) => (v === 2 ? 'var(--green)' : v === 1 ? 'var(--yellow)' : v === 0 ? 'var(--grey)' : 'transparent');
    if (boards === 1) return { background: col(st[0]), color: st[0] >= 0 ? '#fff' : undefined, borderColor: 'transparent' };
    const stops = st.map((v, i) => `${col(v)} ${(i * 100) / boards}% ${((i + 1) * 100) / boards}%`).join(',');
    return { background: `linear-gradient(90deg, ${stops})`, color: '#fff', borderColor: 'transparent', textShadow: '0 1px 1px rgba(0,0,0,.35)' };
  };

  const share = async () => {
    const rows: string[] = [];
    for (let gi = 0; gi < guesses.length; gi++) {
      rows.push(answers.map((a, b) => (solvedAt[b] >= 0 && gi > solvedAt[b] ? '⬜⬜⬜⬜⬜' : scoreGuess(guesses[gi], a).map((c) => EMOJI[c]).join(''))).join(' '));
    }
    const text = `${title} ${mode === 'daily' ? '#' + (dayNumber() + 1) : '(unlimited)'} ${won ? guesses.length : 'X'}/${maxGuesses}\n\n${rows.join('\n')}\n\n${location.origin}${location.pathname}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { flash('Could not copy'); }
  };

  const hms = (() => {
    const d = new Date(now); const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const s = Math.max(0, Math.floor((next.getTime() - now) / 1000));
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  })();
  const winPct = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...stats.dist);

  const rowsFor = (b: number) => Array.from({ length: maxGuesses }, (_, r) => {
    const solved = solvedAt[b];
    if (solved >= 0 && r > solved) return { word: '', res: null as Cell[] | null, typing: false };
    if (r < guesses.length) return { word: guesses[r], res: scoreGuess(guesses[r], answers[b]), typing: false };
    if (r === guesses.length && !over) return { word: current, res: null, typing: true };
    return { word: '', res: null, typing: false };
  });

  return (
    <div className={`wg wg-${boards}`}>
      <div className="wg-top">
        <div className="wg-modes" role="group" aria-label="Game mode">
          <button type="button" className={mode === 'daily' ? 'on' : ''} onClick={() => newGame('daily')}>Daily</button>
          <button type="button" className={mode === 'unlimited' ? 'on' : ''} onClick={() => newGame('unlimited')}>Unlimited</button>
        </div>
        <div className="wg-meta" aria-live="polite">
          <span><b>{guesses.length}</b>/{maxGuesses} guesses</span>
          {stats.streak > 0 && <span className="wg-streak" title="Daily streak">🔥 {stats.streak}</span>}
          <button type="button" className="wg-icon" onClick={() => setShowStats(true)} aria-label="Statistics">📊</button>
        </div>
      </div>

      {toast && <div className="wg-toast" role="status">{toast}</div>}

      <div className="wg-boards">
        {answers.map((_, b) => (
          <div key={b} className={`wg-board ${solvedAt[b] >= 0 ? 'solved' : ''}`} role="group" aria-label={`Board ${b + 1}`}>
            {rowsFor(b).map((row, r) => (
              <div key={r} className={`wg-row ${row.typing && shake ? 'shake' : ''}`}>
                {Array.from({ length: 5 }, (_, i) => {
                  const ch = row.word[i] || '';
                  const st = row.res ? row.res[i] : null;
                  return (
                    <div key={i} className={`wg-tile ${st === null ? (ch ? 'filled' : '') : 'rev s' + st}`} style={st !== null ? { animationDelay: `${i * 120}ms` } : undefined}>
                      <span>{ch}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="wg-kb" aria-label="Keyboard">
        {KEYBOARD.map((row, ri) => (
          <div key={ri} className="wg-kbrow">
            {ri === 2 && <button type="button" className="wg-key wide" onClick={() => press('enter')}>Enter</button>}
            {row.split('').map((k) => (
              <button key={k} type="button" className="wg-key" style={keyStyle(k)} onClick={() => press(k)}>{k}</button>
            ))}
            {ri === 2 && <button type="button" className="wg-key wide" onClick={() => press('back')} aria-label="Backspace">⌫</button>}
          </div>
        ))}
      </div>

      {over && !showStats && (
        <div className="wg-over">
          <p>{won ? `🎉 Solved in ${guesses.length}!` : `The word${boards > 1 ? 's were' : ' was'} ${answers.map((a) => a.toUpperCase()).join(', ')}`}</p>
          <button type="button" className="btn btn-primary" onClick={() => setShowStats(true)}>Results</button>
        </div>
      )}

      {showStats && (
        <div className="wg-modal" role="dialog" aria-modal="true" aria-label="Results and statistics" onClick={(e) => e.target === e.currentTarget && setShowStats(false)}>
          <div className="wg-modal-card">
            <button type="button" className="wg-x" onClick={() => setShowStats(false)} aria-label="Close">×</button>
            <h2>{over ? (won ? 'Brilliant!' : 'Next time!') : 'Statistics'}</h2>
            {over && <p className="wg-answers">{answers.map((a) => <span key={a} className="wg-ans">{a}</span>)}</p>}
            <div className="wg-stats">
              <div><b>{stats.played}</b><span>Played</span></div>
              <div><b>{winPct}</b><span>Win %</span></div>
              <div><b>{stats.streak}</b><span>Streak</span></div>
              <div><b>{stats.best}</b><span>Best</span></div>
            </div>
            <div className="wg-dist" aria-label="Guess distribution">
              {stats.dist.map((n, i) => (
                <div key={i} className="wg-dist-row"><span>{i + 1}</span><div><i style={{ width: `${Math.max(8, (n / maxDist) * 100)}%` }} className={won && guesses.length === i + 1 && mode === 'daily' ? 'hit' : ''}>{n}</i></div></div>
              ))}
            </div>
            <div className="wg-actions">
              {over && <button type="button" className="btn btn-primary" onClick={share}>{copied ? 'Copied!' : 'Share result'}</button>}
              <button type="button" className="btn btn-ghost" onClick={() => newGame('unlimited')}>Play unlimited</button>
            </div>
            {mode === 'daily' && over && <p className="wg-next">Next daily puzzle in <b>{hms}</b></p>}
            <p className="wg-help">Stuck on another puzzle? <a href="/wordle-solver">Try the Wordle Solver</a> or <a href="/word-unscrambler">unscramble your letters</a>.</p>
          </div>
        </div>
      )}
    </div>
  );
}
