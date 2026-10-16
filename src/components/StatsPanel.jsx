import { CheckCheck, Flame, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

function Stat({ icon: Icon, label, value, hint, children }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-neon/10 text-neon">
          <Icon size={20} />
        </span>
        <div>
          <p className="font-display text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-xs text-mute">{label}</p>
        </div>
      </div>
      {children}
      {hint && <p className="mt-3 text-xs text-mute">{hint}</p>}
    </div>
  );
}

export default function StatsPanel({ stats }) {
  const { totalCompleted, streak, todayPercent, completedCount, missionCount } = stats;

  return (
    <section className="glass p-4 sm:p-6" aria-labelledby="stats-title">
      <h2 id="stats-title" className="mb-4 font-display text-lg font-bold tracking-wide sm:text-xl">
        PLAYER STATS
      </h2>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <Stat icon={CheckCheck} label="Missions completed" value={totalCompleted} />
        <Stat
          icon={Flame}
          label="Day streak"
          value={streak}
          hint={streak === 0 ? 'Complete a mission to start one.' : undefined}
        />
        <Stat icon={Percent} label="Done today" value={`${todayPercent}%`}>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              className="h-full rounded-full bg-neon"
              initial={false}
              animate={{ width: `${todayPercent}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
            />
          </div>
          <p className="mt-2 text-xs text-mute">
            {completedCount} of {missionCount} missions
          </p>
        </Stat>
      </div>
    </section>
  );
}
