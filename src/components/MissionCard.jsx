import { motion } from 'framer-motion';
import { BookOpen, Check, Dumbbell, GraduationCap, Sparkles, Sunrise, Target } from 'lucide-react';

const ICONS = {
  study: GraduationCap,
  exercise: Dumbbell,
  read: BookOpen,
  skill: Target,
  wake: Sunrise,
  custom: Sparkles,
};

export default function MissionCard({ mission, done, onComplete }) {
  const Icon = ICONS[mission.icon] ?? Sparkles;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors duration-200 sm:gap-4 sm:p-4 ${
        done
          ? 'border-neon/25 bg-neon/[0.04]'
          : 'border-white/[0.07] bg-white/[0.02] hover:border-violet/40 hover:bg-white/[0.04]'
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          done ? 'bg-neon/15 text-neon' : 'bg-violet/15 text-violet'
        }`}
      >
        <Icon size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold sm:text-base ${done ? 'text-mute line-through decoration-white/20' : ''}`}>
          {mission.title}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-mute">
          <span className="font-display font-semibold text-neon">+{mission.xp} XP</span>
          <span aria-hidden="true">•</span>
          <span>{done ? 'Completed' : 'Pending'}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onComplete(mission.id)}
        disabled={done}
        aria-label={done ? `${mission.title} completed` : `Complete ${mission.title}`}
        className={`btn w-[7.5rem] shrink-0 active:scale-95 ${
          done ? 'bg-neon/10 text-neon' : 'bg-neon text-void hover:bg-[#c8ff6e] hover:shadow-glow'
        }`}
      >
        {done ? (
          <>
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <motion.path
                d="M4 12.5l5 5L20 6.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </motion.svg>
            Done
          </>
        ) : (
          <>
            <Check size={16} />
            Complete
          </>
        )}
      </button>
    </motion.li>
  );
}
