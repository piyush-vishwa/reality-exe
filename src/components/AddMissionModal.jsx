import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { XP_OPTIONS } from '../data/defaults.js';

const MAX_TITLE = 60;

export default function AddMissionModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [xp, setXp] = useState(20);
  const [error, setError] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setXp(20);
    setError('');
    const t = setTimeout(() => input.current?.focus(), 50);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const submit = (e) => {
    e.preventDefault();
    const clean = title.trim().replace(/\s+/g, ' ');
    if (!clean) return setError('Give your mission a title.');
    onSave(clean.slice(0, MAX_TITLE), xp);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onSubmit={submit}
            noValidate
            className="glass w-full max-w-md bg-card p-5 shadow-violet sm:p-6"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="add-title" className="font-display text-lg font-bold tracking-wide">
                NEW MISSION
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-mute hover:bg-white/5 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <label htmlFor="mission-title" className="text-sm font-semibold">
              Mission title
            </label>
            <input
              id="mission-title"
              ref={input}
              value={title}
              maxLength={MAX_TITLE}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Drink 2 liters of water"
              aria-invalid={!!error}
              aria-describedby={error ? 'title-error' : undefined}
              className={`mt-2 w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:ring-2 ${
                error ? 'border-red-400/60 focus:ring-red-400/40' : 'border-white/10 focus:ring-neon/50'
              }`}
            />
            {error && (
              <p id="title-error" role="alert" className="mt-1.5 text-xs text-red-300">
                {error}
              </p>
            )}

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">XP reward</legend>
              <div className="mt-2 grid grid-cols-4 gap-2" role="radiogroup">
                {XP_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={xp === v}
                    onClick={() => setXp(v)}
                    className={`rounded-xl border py-2.5 font-display text-sm font-semibold transition active:scale-95 ${
                      xp === v
                        ? 'border-neon bg-neon/10 text-neon'
                        : 'border-white/10 text-mute hover:border-white/25 hover:text-ink'
                    }`}
                  >
                    {v} XP
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn text-mute hover:bg-white/5 hover:text-ink">
                Cancel
              </button>
              <button type="submit" className="btn bg-neon text-void hover:bg-[#c8ff6e] active:scale-95">
                Save
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
