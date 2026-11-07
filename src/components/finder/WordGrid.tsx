import { memo, useCallback, useEffect, useRef, useState } from 'react';
import WordDefinition from './WordDefinition';
import { LIKES_EVENT, loadLikes, toggleLike } from '../../lib/likes';

export type WordItem = { word: string; pts?: number };
type Props = {
  items: WordItem[];
  uppercase?: boolean;
  showPoints?: boolean;
  tint?: (word: string, index: number) => string;
};

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through to legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

type ChipProps = { word: string; shown: string; pts?: number; liked: boolean; copied: boolean; tint?: Props['tint']; onCopy: (word: string, shown: string) => void; onOpen: (word: string) => void; onLike: (word: string) => void };

const Chip = memo(function Chip({ word, shown, pts, liked, copied, tint, onCopy, onOpen, onLike }: ChipProps) {
  return (
    <li className={`word${liked ? ' is-liked' : ''}${copied ? ' is-copied' : ''}`}>
      <button type="button" className="word-main" onClick={() => onOpen(word)} aria-label={`${shown} — view definition`} aria-haspopup="dialog">
        <span className="w">{[...shown].map((ch, i) => <span key={i} className={tint ? tint(word, i) : ''}>{ch}</span>)}</span>
        {pts !== undefined && <span className="pts">{pts}</span>}
        <span className="word-tip" role="tooltip">Click for definition</span>
      </button>
      <button type="button" className="like-btn" aria-pressed={liked} aria-label={liked ? `Unlike ${shown}` : `Like ${shown}`} title={liked ? 'Remove from liked' : 'Like this word'} onClick={() => onLike(word)}>
        <Heart filled={liked} />
      </button>
    </li>
  );
});

export default function WordGrid({ items, uppercase, showPoints = true, tint }: Props) {
  const [likes, setLikes] = useState<Set<string>>(() => new Set());
  const [copiedWord, setCopiedWord] = useState('');
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    setLikes(loadLikes());
    const sync = () => setLikes(loadLikes());
    window.addEventListener(LIKES_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(LIKES_EVENT, sync); window.removeEventListener('storage', sync); window.clearTimeout(timer.current); };
  }, []);

  const onCopy = useCallback(async (word: string, shown: string) => {
    const ok = await copyText(shown);
    window.clearTimeout(timer.current);
    setCopiedWord(ok ? word : '');
    setNotice({ ok, text: ok ? `“${shown}” copied to clipboard` : `Couldn’t copy “${shown}” — select it and copy manually` });
    timer.current = window.setTimeout(() => { setCopiedWord(''); setNotice(null); }, 2000);
  }, []);
  const [openWord, setOpenWord] = useState('');
  const closeDef = useCallback(() => setOpenWord(''), []);
  const onLike = useCallback((word: string) => setLikes(toggleLike(word)), []);

  return (
    <>
      <ul className={`word-grid ${uppercase ? 'upper' : ''}`}>
        {items.map(({ word, pts }) => (
          <Chip key={word} word={word} shown={uppercase ? word.toUpperCase() : word} pts={showPoints ? pts : undefined}
            liked={likes.has(word)} copied={copiedWord === word} tint={tint} onCopy={onCopy} onOpen={setOpenWord} onLike={onLike} />
        ))}
      </ul>
      <div className="copy-notice-wrap" aria-live="polite" role="status">
        {notice && <div className={`copy-notice${notice.ok ? '' : ' is-error'}`}>{notice.ok && <span aria-hidden="true">✓ </span>}{notice.text}</div>}
      </div>
      {openWord && <WordDefinition word={openWord} onClose={closeDef} onCopy={onCopy} />}
    </>
  );
}
