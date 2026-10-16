import { useCallback, useState } from 'react';
import { useGame } from './hooks/useGame.js';
import Navbar from './components/Navbar.jsx';
import ProfileCard from './components/ProfileCard.jsx';
import MissionList from './components/MissionList.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import SystemMessage from './components/SystemMessage.jsx';
import AddMissionModal from './components/AddMissionModal.jsx';
import Toasts from './components/Toasts.jsx';
import LevelUpOverlay from './components/LevelUpOverlay.jsx';

export default function App() {
  const game = useGame();
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <Navbar level={game.level} onResetToday={game.resetToday} onResetAll={game.resetAll} />

      <main>
        <h1 className="mt-8 font-display text-3xl font-bold leading-tight tracking-tight sm:mt-12 sm:text-5xl">
          Your life. Your rules. Your level.
        </h1>

        <div className="mt-6">
          <ProfileCard level={game.level} xpIntoLevel={game.xpIntoLevel} totalXp={game.totalXp} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <MissionList
  missions={game.missions}
  completedToday={game.completedToday}
  onComplete={game.completeMission}
  onAdd={() => setModalOpen(true)}
  onDelete={game.deleteMission}
/>
          <StatsPanel stats={game.stats} />
        </div>

        <div className="mt-6">
          <SystemMessage />
        </div>
      </main>

      <AddMissionModal open={modalOpen} onClose={closeModal} onSave={game.addMission} />
      <Toasts toasts={game.toasts} />
      <LevelUpOverlay level={game.levelUp} onDismiss={game.dismissLevelUp} />
    </div>
  );
}
