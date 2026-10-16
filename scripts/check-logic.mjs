// Plain-node checks for the game rules. Run: npm run test:logic
import assert from 'node:assert/strict';
import {
  createInitialState, reducer, levelFromXp, xpIntoLevel, currentStreak,
  previousDateKey, loadState, saveState, STORAGE_KEY,
} from '../src/lib/game.js';

const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const done = (s, id, xp, today) => reducer(s, { type: 'COMPLETE', id, xp, today });
let n = 0; const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('level formula: 0→L1, 99→L1, 100→L2, 240→L3 with 40 into level', () => {
  assert.equal(levelFromXp(0), 1); assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2); assert.equal(levelFromXp(240), 3); assert.equal(xpIntoLevel(240), 40);
});

t('XP is awarded once per mission per day', () => {
  let s = createInitialState('2026-10-12');
  s = done(s, 'study', 50, '2026-10-12');
  const again = done(s, 'study', 50, '2026-10-12');
  assert.equal(again, s); assert.equal(s.totalXp, 50); assert.equal(s.totalCompleted, 1);
});

t('new day clears checkmarks but keeps XP, lifetime count', () => {
  let s = done(createInitialState('2026-10-12'), 'study', 50, '2026-10-12');
  s = reducer(s, { type: 'SYNC_DAY', today: '2026-10-13' });
  assert.deepEqual(s.completedToday, []); assert.equal(s.totalXp, 50); assert.equal(s.totalCompleted, 1);
  s = done(s, 'study', 50, '2026-10-13');
  assert.equal(s.totalXp, 100);
});

t('streak: same day no double count, consecutive +1, gap resets', () => {
  let s = createInitialState('2026-10-12');
  s = done(s, 'a', 10, '2026-10-12'); s = done(s, 'b', 10, '2026-10-12');
  assert.equal(s.streak.count, 1);
  s = done(s, 'a', 10, '2026-10-13'); assert.equal(s.streak.count, 2);
  assert.equal(currentStreak(s.streak, '2026-10-14'), 2);
  assert.equal(currentStreak(s.streak, '2026-10-15'), 0);
  s = done(s, 'a', 10, '2026-10-16'); assert.equal(s.streak.count, 1);
});

t('month and year boundaries', () => {
  assert.equal(previousDateKey('2026-03-01'), '2026-02-28');
  assert.equal(previousDateKey('2027-01-01'), '2026-12-31');
  assert.equal(previousDateKey('2028-03-01'), '2028-02-29');
});

t('manual reset does not allow XP farming', () => {
  let s = done(createInitialState('2026-10-12'), 'study', 50, '2026-10-12');
  s = reducer(s, { type: 'RESET_TODAY', today: '2026-10-12' });
  assert.deepEqual(s.completedToday, []);
  s = done(s, 'study', 50, '2026-10-12');
  assert.equal(s.totalXp, 50); assert.equal(s.completedToday.length, 1);
});

t('storage round-trip, day rollover on load, corrupt data fallback', () => {
  const st = mem();
  let s = done(createInitialState('2026-10-12'), 'study', 50, '2026-10-12');
  s = reducer(s, { type: 'ADD_MISSION', mission: { id: 'c-1', title: 'Water', xp: 20, icon: 'custom' } });
  saveState(s, st);
  const same = loadState('2026-10-12', st);
  assert.equal(same.totalXp, 50); assert.deepEqual(same.completedToday, ['study']); assert.equal(same.customMissions.length, 1);
  const next = loadState('2026-10-13', st);
  assert.deepEqual(next.completedToday, []); assert.equal(next.totalXp, 50); assert.equal(next.streak.count, 1);
  st.setItem(STORAGE_KEY, '{nope');
  assert.equal(loadState('2026-10-12', st).totalXp, 0);
  st.setItem(STORAGE_KEY, JSON.stringify({ totalXp: -5, customMissions: [{ id: 1 }, { id: 'x', title: 't', xp: 999 }] }));
  const bad = loadState('2026-10-12', st);
  assert.equal(bad.totalXp, 0); assert.equal(bad.customMissions.length, 0);
});

console.log(`\n${n} checks passed`);
