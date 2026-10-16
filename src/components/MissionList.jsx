import { Plus, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MissionCard from './MissionCard.jsx';

export default function MissionList({
  missions,
  completedToday,
  onComplete,
  onAdd,
  onDelete,
}) {
  return (
    <section className="glass p-4 sm:p-6" aria-labelledby="missions-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="missions-title"
          className="font-display text-lg font-bold tracking-wide sm:text-xl"
        >
          DAILY MISSIONS
        </h2>

        <button
          type="button"
          onClick={onAdd}
          className="btn border border-violet/40 bg-violet/10 text-violet hover:bg-violet/20 active:scale-95"
        >
          <Plus size={16} />
          ADD MISSION
        </button>
      </div>

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {missions.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <MissionCard
                  mission={m}
                  done={completedToday.includes(m.id)}
                  onComplete={onComplete}
                />
              </div>

              {m.isCustom && (
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  aria-label={`Delete mission ${m.title}`}
                  title="Delete custom mission"
                  className="mt-2 rounded-lg border border-red-500/30 p-2 text-red-400 transition hover:bg-red-500/10 active:scale-95"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}