import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { XP_PER_LEVEL } from '../lib/game.js';

export default function ProfileCard({ level, xpIntoLevel, totalXp }) {
  const pct = (xpIntoLevel / XP_PER_LEVEL) * 100;

  return (
    <section className="glass relative overflow-hidden p-5 shadow-violet sm:p-7" aria-label="Player profile">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet to-violet/30 ring-1 ring-white/15 sm:h-20 sm:w-20">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-wide sm:text-2xl">PLAYER ONE</p>
            <p className="text-sm text-mute">{totalXp} XP earned in total</p>
          </div>
        </div>

        <div className="flex-1 sm:pl-4">
          <div className="mb-2 flex items-end justify-between gap-4">
            <p className="font-display text-4xl font-bold leading-none sm:text-5xl">
              <span className="mr-2 text-sm font-semibold text-mute sm:text-base">LEVEL</span>
              <span className="text-neon">{String(level).padStart(2, '0')}</span>
            </p>
            <p className="font-display text-sm font-semibold sm:text-base">
              XP: {xpIntoLevel} / {XP_PER_LEVEL}
            </p>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-white/[0.07]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={XP_PER_LEVEL}
            aria-valuenow={xpIntoLevel}
            aria-label="XP progress to next level"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon/80 to-neon shadow-glow"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
            />
          </div>
          <p className="mt-2 text-xs text-mute">{XP_PER_LEVEL - xpIntoLevel} XP to level {level + 1}</p>
        </div>
      </div>
    </section>
  );
}
