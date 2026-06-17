import React from 'react';
import { navigate } from '../Router.js';

import { useUIStore } from '../stores/uiStore.js';
import { Board } from '../components/board/Board.js';
import { GameInfo } from '../components/game/GameInfo.js';
import { GameControls } from '../components/game/GameControls.js';
import { MoveHistory } from '../components/game/MoveHistory.js';
import { CapturedPieces } from '../components/game/CapturedPieces.js';
import { GameResult } from '../components/game/GameResult.js';
import { Modal } from '../components/ui/Modal.js';
import { Button } from '../components/ui/Button.js';
import { ArrowLeft, BookOpen, Settings, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../hooks/useGame.js';

export const GamePage: React.FC = () => {
  // Use the reactive hook to play sounds
  useGame();


  const { 
    boardTheme, 
    setBoardTheme, 
    soundsEnabled, 
    toggleSounds,
    rulesModalOpen,
    setRulesModalOpen,
    settingsModalOpen,
    setSettingsModalOpen
  } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Game
          </button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRulesModalOpen(true)}
              leftIcon={<BookOpen className="h-4 w-4" />}
              className="text-xs"
            >
              Rules
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsModalOpen(true)}
              leftIcon={<Settings className="h-4 w-4" />}
              className="text-xs"
            >
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {/* Game Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:items-stretch">
          
          {/* Left Side: Board Container */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <Board />
          </div>

          {/* Right Side: Game Panels */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            {/* Info panel */}
            <GameInfo />
            
            {/* Capture Counter */}
            <CapturedPieces />

            {/* Move Log History */}
            <div className="flex-grow">
              <MoveHistory />
            </div>

            {/* Play Actions Controls */}
            <GameControls />
          </div>

        </div>
      </main>

      {/* Game Over Victory Overlay */}
      <GameResult />

      {/* Rules Modal */}
      <Modal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        title="Baghchal Game Rules"
        size="md"
      >
        <div className="flex flex-col gap-4 text-slate-300 text-sm leading-relaxed font-medium">
          <p>
            Baghchal is a two-player strategic board game from Nepal. One player controls 
            <span className="text-orange-400 font-bold"> 4 Tigers </span> 
            and the other controls <span className="text-slate-100 font-bold"> 20 Goats</span>.
          </p>
          
          <h3 className="font-bold text-orange-400 border-b border-slate-900 pb-1.5 mt-2 uppercase tracking-wide text-xs">
            1. Placement Phase
          </h3>
          <p>
            The game begins with the 4 Tigers placed in the four corners of the board. The Goat player goes first. 
            During this phase, Goats are placed one by one on empty board intersections. 
            Tigers can move to adjacent vacant spots or capture goats by jumping over them.
          </p>
          
          <h3 className="font-bold text-orange-400 border-b border-slate-900 pb-1.5 mt-2 uppercase tracking-wide text-xs">
            2. Movement Phase
          </h3>
          <p>
            Once all 20 Goats have been placed, the Movement Phase begins. In this phase, Goats can also 
            be moved to adjacent empty intersections along the lines.
          </p>

          <h3 className="font-bold text-orange-400 border-b border-slate-900 pb-1.5 mt-2 uppercase tracking-wide text-xs">
            3. Capturing Goats
          </h3>
          <p>
            Tigers capture Goats by jumping over an adjacent goat into an empty position directly behind it along a grid line.
          </p>

          <h3 className="font-bold text-orange-400 border-b border-slate-900 pb-1.5 mt-2 uppercase tracking-wide text-xs">
            4. Faction Victory
          </h3>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <span className="text-orange-400 font-bold">Tigers win</span> by capturing 
              <span className="text-red-400 font-bold"> 5 Goats</span>.
            </li>
            <li>
              <span className="text-slate-100 font-bold">Goats win</span> by trapping all 
              4 Tigers so they have no legal moves.
            </li>
          </ul>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Game Settings"
        size="sm"
      >
        <div className="flex flex-col gap-6 p-1">
          {/* Board Theme Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Board Visual Theme
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBoardTheme('wood')}
                className={`
                  p-3 rounded-lg border text-center font-bold text-sm transition-all
                  ${boardTheme === 'wood'
                    ? 'border-orange-500 bg-orange-950/15 text-orange-400 shadow'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/20 text-slate-400'
                  }
                `}
              >
                🌲 Traditional Wood
              </button>
              <button
                onClick={() => setBoardTheme('modern-dark')}
                className={`
                  p-3 rounded-lg border text-center font-bold text-sm transition-all
                  ${boardTheme === 'modern-dark'
                    ? 'border-orange-500 bg-orange-950/15 text-orange-400 shadow'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/20 text-slate-400'
                  }
                `}
              >
                🌌 Modern Dark
              </button>
            </div>
          </div>

          {/* Sound Toggles */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Sound Effects</span>
              <span className="text-xs text-slate-500 mt-0.5">Toggle board move and capture audio</span>
            </div>
            
            <button
              onClick={toggleSounds}
              className={`
                p-2.5 rounded-lg border transition-all
                ${soundsEnabled
                  ? 'border-emerald-500/30 bg-emerald-950/15 text-emerald-400'
                  : 'border-slate-800 bg-slate-900/40 text-slate-500'
                }
              `}
            >
              {soundsEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export { GamePage as default };
