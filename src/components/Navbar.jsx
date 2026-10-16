import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Settings, Trash2 } from 'lucide-react';

export default function Navbar({ level, onResetToday, onResetAll }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const confirmResetAll = () => {
    setOpen(false);
    if (window.confirm('Reset all progress? XP, level, streak and custom missions will be erased.')) {
      onResetAll();
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-white/[0.06] py-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-bold tracking-wide sm:text-xl">
          REALITY<span className="text-neon">.EXE</span>
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-neon/20 bg-neon/[0.07] px-2 py-0.5 text-xs text-neon">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon" />
          </span>
          online
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-white/[0.08] bg-card px-3 py-1.5 font-display text-sm font-semibold">
          LVL <span className="text-neon">{String(level).padStart(2, '0')}</span>
        </span>

        <div className="relative" ref={wrap}>
          <button
            type="button"
            aria-label="Settings"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-card text-mute transition hover:text-ink active:scale-95"
          >
            <Settings size={18} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-white/10 bg-card p-1.5 shadow-2xl"
            >
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  onResetToday();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/5"
              >
                <RotateCcw size={16} className="text-neon" />
                Reset today's missions
              </button>
              <button
                role="menuitem"
                type="button"
                onClick={confirmResetAll}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-400/10"
              >
                <Trash2 size={16} />
                Reset all progress
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
