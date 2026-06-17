import React, { useState } from 'react';
import { navigate } from '../Router.js';
import { Button } from '../components/ui/Button.js';
import { useGameStore } from '../stores/gameStore.js';
import { AILevel, Player, GameMode, AI_LEVEL_INFO } from '@baghchal/shared';
import { ArrowLeft, Cpu } from 'lucide-react';

export const PlayPage: React.FC = () => {
  const { startGame } = useGameStore();
  const [selectedSide, setSelectedSide] = useState<Player>(Player.Goat);
  const [selectedLevel, setSelectedLevel] = useState<AILevel>(AILevel.Medium);

  const handleStartGame = () => {
    startGame(GameMode.AI, {
      aiLevel: selectedLevel,
      playerSide: selectedSide,
    });
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lobby
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-center gap-8 my-6">
        {/* Title */}
        <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-4 border-b border-slate-900 pb-4">
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
            <Cpu className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-50">AI Configuration</h1>
            <p className="text-sm text-slate-400 font-medium">Select your faction and test your wits against classical heuristics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Side Selection */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Choose Faction
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Goats */}
              <button
                onClick={() => setSelectedSide(Player.Goat)}
                className={`
                  flex-1 p-5 rounded-xl border text-center flex flex-col items-center gap-3 transition-all duration-300
                  ${selectedSide === Player.Goat 
                    ? 'bg-slate-900/60 border-slate-300/80 ring-2 ring-slate-400/20 scale-102 shadow-xl' 
                    : 'bg-slate-900/20 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800'
                  }
                `}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-50 to-slate-300 flex items-center justify-center text-3xl shadow-inner">
                  🐐
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Play as Goats</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                    Place and move goats to corral the tigers. Moves first.
                  </p>
                </div>
              </button>

              {/* Tigers */}
              <button
                onClick={() => setSelectedSide(Player.Tiger)}
                className={`
                  flex-1 p-5 rounded-xl border text-center flex flex-col items-center gap-3 transition-all duration-300
                  ${selectedSide === Player.Tiger 
                    ? 'bg-orange-950/10 border-orange-500/80 ring-2 ring-orange-500/20 scale-102 shadow-xl' 
                    : 'bg-slate-900/20 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800'
                  }
                `}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-3xl shadow-inner">
                  🐅
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Play as Tigers</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                    Hunt down the goats before they block you. Moves second.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Select Difficulty
            </h2>
            <div className="flex flex-col gap-2.5">
              {([1, 2, 3, 4, 5] as AILevel[]).map((level) => {
                const info = AI_LEVEL_INFO[level];
                const isSelected = selectedLevel === level;

                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`
                      w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all duration-200
                      ${isSelected 
                        ? 'bg-slate-900/60 border-orange-500/40 ring-1 ring-orange-500/30 shadow-md shadow-orange-500/5' 
                        : 'bg-slate-900/20 border-slate-850 hover:bg-slate-900/35 hover:border-slate-800'
                      }
                    `}
                  >
                    <div className="text-2xl w-10 h-10 rounded-lg bg-slate-950/40 flex items-center justify-center flex-shrink-0">
                      {info.emoji}
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-slate-200 text-sm flex items-center justify-between">
                        <span>{info.name}</span>
                        {isSelected && <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wide">Selected</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium leading-relaxed">
                        {info.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex flex-col items-center">
          <Button
            variant="primary"
            onClick={handleStartGame}
            size="lg"
            className="w-full sm:max-w-md py-4 text-base"
          >
            Start Faction Match
          </Button>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-600 mt-6 font-medium">
        Baghchal Platform • Level 5 Expert performs 8-ply iterative deepening search
      </footer>
    </div>
  );
};
export { PlayPage as default };
