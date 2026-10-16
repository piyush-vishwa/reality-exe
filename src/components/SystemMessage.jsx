import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SYSTEM_MESSAGES } from '../data/defaults.js';

const pick = (exclude) => {
  let i;
  do i = Math.floor(Math.random() * SYSTEM_MESSAGES.length);
  while (i === exclude && SYSTEM_MESSAGES.length > 1);
  return i;
};

export default function SystemMessage() {
  const [index, setIndex] = useState(() => pick(-1));
  const [spins, setSpins] = useState(0);

  return (
    <section className="glass flex items-center justify-between gap-4 p-4 sm:p-5" aria-labelledby="sys-title">
      <div className="min-w-0">
        <h2 id="sys-title" className="font-display text-sm font-bold tracking-wide text-violet">
          SYSTEM MESSAGE
        </h2>
        <p className="mt-1 text-sm sm:text-base" aria-live="polite">
          {SYSTEM_MESSAGES[index]}
        </p>
      </div>
      <button
        type="button"
        aria-label="New message"
        onClick={() => {
          setIndex((i) => pick(i));
          setSpins((s) => s + 1);
        }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-mute transition hover:text-ink active:scale-95"
      >
        <motion.span animate={{ rotate: spins * 180 }} transition={{ duration: 0.3 }} className="grid">
          <RefreshCw size={16} />
        </motion.span>
      </button>
    </section>
  );
}
