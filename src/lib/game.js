import { XP_OPTIONS } from '../data/defaults.js';

export const STORAGE_KEY = 'reality.exe:v1';
export const XP_PER_LEVEL = 100;

/* ---------- levels ---------- */
export const levelFromXp = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp) => xp % XP_PER_LEVEL;

/* ---------- dates (local calendar days, 'YYYY-MM-DD') ---------- */
const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function previousDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1)); // Date handles month/year/DST rollover
}

/* ---------- state ---------- */
export function createInitialState(today) {
  return {
    totalXp: 0,
    customMissions: [],
    completedToday: [], // mission ids checked off today
    claimedToday: [], // mission ids that already paid XP today
    lastDate: today, // last recorded date
    totalCompleted: 0, // lifetime XP-paying completions
    streak: { count: 0, lastDate: null },
  };
}

/** Streak as it should be displayed today (0 if a full day was missed). */
export function currentStreak(streak, today) {
  if (!streak.lastDate) return 0;
  return streak.lastDate === today || streak.lastDate === previousDateKey(today) ? streak.count : 0;
}

function rollover(state, today) {
  if (state.lastDate === today) return state;
  return { ...state, lastDate: today, completedToday: [], claimedToday: [] };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SYNC_DAY':
      return rollover(state, action.today);

    case 'COMPLETE': {
      const s = rollover(state, action.today);
      if (s.completedToday.includes(action.id)) return s;
      const completedToday = [...s.completedToday, action.id];
      if (s.claimedToday.includes(action.id)) return { ...s, completedToday }; // re-check after manual reset: no XP

      let count;
      if (s.streak.lastDate === action.today) count = s.streak.count;
      else if (s.streak.lastDate === previousDateKey(action.today)) count = s.streak.count + 1;
      else count = 1;

      return {
        ...s,
        completedToday,
        claimedToday: [...s.claimedToday, action.id],
        totalXp: s.totalXp + action.xp,
        totalCompleted: s.totalCompleted + 1,
        streak: { count, lastDate: action.today },
      };
    }

    case 'SET_CUSTOM_MISSIONS':
  return { ...state, customMissions: action.missions };

case 'ADD_MISSION':
  return {
    ...state,
    customMissions: [...state.customMissions, action.mission],
  };
  case 'REMOVE_CUSTOM_MISSION':
  return {
    ...state,
    customMissions: state.customMissions.filter(
      (mission) => mission.id !== action.id
    ),
    completedToday: state.completedToday.filter(
      (id) => id !== action.id
    ),
    claimedToday: state.claimedToday.filter(
      (id) => id !== action.id
    ),
  };
    case 'RESET_TODAY':
      return { ...rollover(state, action.today), completedToday: [] };

    case 'RESET_ALL':
      return createInitialState(action.today);
    
    case 'LOAD_PROGRESS':
  return {
    ...state,
    totalXp: action.progress.totalXp,
    completedToday: action.progress.completedToday,
    claimedToday: action.progress.claimedToday,
    lastDate: action.progress.lastDate,
    totalCompleted: action.progress.totalCompleted,
    streak: action.progress.streak,
  };
    default:
      return state;
  }
}

/* ---------- storage ---------- */
const isCount = (n) => Number.isFinite(n) && n >= 0;
const strings = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);

export function loadState(today, storage = globalThis.localStorage) {
  const fresh = createInitialState(today);
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const d = JSON.parse(raw);
    const loaded = {
      totalXp: isCount(d.totalXp) ? Math.floor(d.totalXp) : 0,
      customMissions: Array.isArray(d.customMissions)
        ? d.customMissions.filter(
            (m) =>
              m && typeof m.id === 'string' && typeof m.title === 'string' && XP_OPTIONS.includes(m.xp),
          )
        : [],
      completedToday: strings(d.completedToday),
      claimedToday: strings(d.claimedToday),
      lastDate: typeof d.lastDate === 'string' ? d.lastDate : today,
      totalCompleted: isCount(d.totalCompleted) ? Math.floor(d.totalCompleted) : 0,
      streak: {
        count: isCount(d.streak?.count) ? Math.floor(d.streak.count) : 0,
        lastDate: typeof d.streak?.lastDate === 'string' ? d.streak.lastDate : null,
      },
    };
    return rollover(loaded, today);
  } catch {
    return fresh;
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the app keeps working in memory */
  }
}
