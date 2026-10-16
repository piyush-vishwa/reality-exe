import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import { DEFAULT_MISSIONS } from '../data/defaults.js';

import {
  currentStreak,
  dateKey,
  levelFromXp,
  loadState,
  reducer,
  saveState,
  xpIntoLevel,
} from '../lib/game.js';

const API_BASE = 'https://reality-exe-backend.onrender.com/api';
const MISSIONS_API = `${API_BASE}/missions`;
const PROGRESS_API = `${API_BASE}/progress`;

export function useGame() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadState(dateKey())
  );

  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  const stateRef = useRef(state);
  const toastId = useRef(0);
  const progressLoaded = useRef(false);
  const saveTimer = useRef(null);

  stateRef.current = state;

  // Save game state locally as a backup.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Toast notifications.
  const pushToast = useCallback((text, tone = 'xp') => {
    const id = ++toastId.current;

    setToasts((items) => [
      ...items.slice(-2),
      { id, text, tone },
    ]);

    setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  // Load custom missions from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function fetchMissions() {
      try {
        const response = await fetch(MISSIONS_API);

        if (!response.ok) {
          throw new Error('Could not load missions');
        }

        const data = await response.json();

        const customMissions = data.map((mission) => ({
          id: mission._id,
          title: mission.title,
          xp: mission.xp,
          icon: 'custom',
          isCustom: true,
        }));

        if (!cancelled) {
          dispatch({
            type: 'SET_CUSTOM_MISSIONS',
            missions: customMissions,
          });
        }
      } catch (error) {
        console.error('Mission loading failed:', error);

        if (!cancelled) {
          pushToast('Could not load missions from server', 'info');
        }
      } finally {
        if (!cancelled) {
          setMissionsLoading(false);
        }
      }
    }

    fetchMissions();

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  // Load game progress from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function fetchProgress() {
      try {
        const response = await fetch(PROGRESS_API);

        if (!response.ok) {
          throw new Error('Could not load saved progress');
        }

        const remote = await response.json();

        if (cancelled) return;

        const local = stateRef.current;

        const remoteHasProgress =
          remote.totalXp > 0 ||
          remote.totalCompleted > 0 ||
          (remote.completedToday?.length ?? 0) > 0 ||
          (remote.claimedToday?.length ?? 0) > 0 ||
          (remote.streak?.count ?? 0) > 0;

        const localHasProgress =
          local.totalXp > 0 ||
          local.totalCompleted > 0 ||
          local.completedToday.length > 0 ||
          local.claimedToday.length > 0 ||
          local.streak.count > 0;

        if (!remoteHasProgress && localHasProgress) {
          progressLoaded.current = true;

          const uploadResponse = await fetch(PROGRESS_API, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              totalXp: local.totalXp,
              completedToday: local.completedToday,
              claimedToday: local.claimedToday,
              lastDate: local.lastDate,
              totalCompleted: local.totalCompleted,
              streak: local.streak,
            }),
          });

          if (!uploadResponse.ok) {
            throw new Error('Could not migrate local progress');
          }

          if (!cancelled) {
            pushToast('Existing progress synced to database');
          }

          return;
        }

        dispatch({
          type: 'LOAD_PROGRESS',
          progress: {
            totalXp: remote.totalXp,
            completedToday: remote.completedToday,
            claimedToday: remote.claimedToday,
            lastDate: remote.lastDate || dateKey(),
            totalCompleted: remote.totalCompleted,
            streak: remote.streak,
          },
        });

        progressLoaded.current = true;
      } catch (error) {
        console.error('Progress loading failed:', error);

        if (!cancelled) {
          pushToast('Could not sync progress with server', 'info');
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    }

    fetchProgress();

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  // Sync progress to MongoDB after state changes.
  useEffect(() => {
    if (!progressLoaded.current) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(PROGRESS_API, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            totalXp: state.totalXp,
            completedToday: state.completedToday,
            claimedToday: state.claimedToday,
            lastDate: state.lastDate,
            totalCompleted: state.totalCompleted,
            streak: state.streak,
          }),
        });

        if (!response.ok) {
          throw new Error('Could not save progress');
        }
      } catch (error) {
        console.error('Progress save failed:', error);
      }
    }, 500);

    return () => clearTimeout(saveTimer.current);
  }, [state]);

  // Keep the game date up to date.
  useEffect(() => {
    const sync = () => {
      dispatch({
        type: 'SYNC_DAY',
        today: dateKey(),
      });
    };

    const id = setInterval(sync, 30000);

    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Auto-dismiss level-up notification.
  useEffect(() => {
    if (!levelUp) return;

    const id = setTimeout(() => setLevelUp(null), 2800);

    return () => clearTimeout(id);
  }, [levelUp]);

  // Combine default and custom missions.
  const missions = [
    ...DEFAULT_MISSIONS,
    ...state.customMissions,
  ];

  // Complete a mission and award XP once per day.
  const completeMission = useCallback(
    (id) => {
      const previous = stateRef.current;

      const mission = [
        ...DEFAULT_MISSIONS,
        ...previous.customMissions,
      ].find((item) => item.id === id);

      if (!mission) return;

      const action = {
        type: 'COMPLETE',
        id,
        xp: mission.xp,
        today: dateKey(),
      };

      const next = reducer(previous, action);

      if (next === previous) return;

      stateRef.current = next;
      dispatch(action);

      if (next.totalXp > previous.totalXp) {
        pushToast(`+${mission.xp} XP · ${mission.title}`);

        const newLevel = levelFromXp(next.totalXp);

        if (newLevel > levelFromXp(previous.totalXp)) {
          setLevelUp(newLevel);
        }
      } else {
        pushToast('XP already claimed today', 'info');
      }
    },
    [pushToast]
  );

  // Create a custom mission in MongoDB.
  const addMission = useCallback(
    async (title, xp) => {
      try {
        const response = await fetch(MISSIONS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, xp }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not save mission');
        }

        const mission = {
          id: data._id,
          title: data.title,
          xp: data.xp,
          icon: 'custom',
          isCustom: true,
        };

        dispatch({
          type: 'ADD_MISSION',
          mission,
        });

        pushToast('Mission saved to database!');
      } catch (error) {
        console.error('Mission save failed:', error);
        pushToast('Mission save failed. Check backend.', 'info');
      }
    },
    [pushToast]
  );

  // Delete a custom mission from MongoDB.
  const deleteMission = useCallback(
    async (id) => {
      const mission = stateRef.current.customMissions.find(
        (item) => item.id === id
      );

      if (!mission) return;

      const confirmed = window.confirm(
        `Delete "${mission.title}" permanently?`
      );

      if (!confirmed) return;

      try {
        const response = await fetch(`${MISSIONS_API}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Could not delete mission');
        }

        dispatch({
          type: 'REMOVE_CUSTOM_MISSION',
          id,
        });

        pushToast('Custom mission deleted');
      } catch (error) {
        console.error('Mission delete failed:', error);
        pushToast('Mission delete failed. Check backend.', 'info');
      }
    },
    [pushToast]
  );

  const resetToday = useCallback(() => {
    dispatch({
      type: 'RESET_TODAY',
      today: dateKey(),
    });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({
      type: 'RESET_ALL',
      today: dateKey(),
    });

    setLevelUp(null);
  }, []);

  const completedCount = missions.filter((mission) =>
    state.completedToday.includes(mission.id)
  ).length;

  return {
    missions,
    completedToday: state.completedToday,
    totalXp: state.totalXp,
    level: levelFromXp(state.totalXp),
    xpIntoLevel: xpIntoLevel(state.totalXp),

    stats: {
      totalCompleted: state.totalCompleted,
      streak: currentStreak(state.streak, dateKey()),
      todayPercent: missions.length
        ? Math.round((completedCount / missions.length) * 100)
        : 0,
      completedCount,
      missionCount: missions.length,
    },

    toasts,
    levelUp,
    missionsLoading,
    progressLoading,

    dismissLevelUp: () => setLevelUp(null),
    completeMission,
    addMission,
    deleteMission,
    resetToday,
    resetAll,
  };
}