import React from 'react';
import { navigate } from '../Router.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Cpu, Users, BookOpen, Landmark } from 'lucide-react';
import { useGameStore } from '../stores/gameStore.js';
import { GameMode } from '@baghchal/shared';

export const HomePage: React.FC = () => {
  const { startGame } = useGameStore();

  const handleStartAI = () => {
    navigate('/play');
  };

  const handleStartLocal = () => {
    startGame(GameMode.Local);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center gap-12 mt-4">
        
        {/* Header / Brand */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 shadow-inner mb-4">
            <Landmark className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400">
              Baghchal
            </span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-400 max-w-md mx-auto font-medium">
            The traditional strategic board game of Nepal, reimagined with modern aesthetics and a strong AI.
          </p>
        </div>

        {/* Game Modes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: VS AI */}
          <Card 
            hoverable 
            onClick={handleStartAI}
            className="flex flex-col justify-between items-start gap-6 border-orange-500/10 hover:border-orange-500/30 group"
          >
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all duration-300">
                <Cpu className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Play vs AI</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Challenge our classical game tree minimax AI. Features 5 difficulty levels from Beginner (perfect for learning) to Expert.
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={handleStartAI}
              className="w-full"
            >
              Configure AI Match
            </Button>
          </Card>

          {/* Card 2: Local Multiplayer */}
          <Card 
            hoverable 
            onClick={handleStartLocal}
            className="flex flex-col justify-between items-start gap-6 border-amber-500/10 hover:border-amber-500/30 group"
          >
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Local Multiplayer</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Play locally with a friend on the same screen. Pass and play mode with full validation and coordinate history logs.
              </p>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleStartLocal}
              className="w-full border-slate-700/80 hover:bg-slate-800"
            >
              Start Local Match
            </Button>
          </Card>
        </div>

        {/* Quick Guide Panel */}
        <Card className="glass-panel border-slate-800/80 max-w-3xl mx-auto w-full p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-850">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-100">Baghchal Rules</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed font-medium">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-orange-400 flex items-center gap-1.5">
                🐅 Tiger Objective
              </h4>
              <p>
                Tigers must capture <span className="text-orange-300 font-bold">5 Goats</span> to win. 
                They capture goats by jumping over an adjacent goat into an empty space along any valid grid line.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                🐐 Goat Objective
              </h4>
              <p>
                Goats must <span className="text-slate-100 font-bold">trap all 4 Tigers</span> so they cannot make any legal moves. 
                Goats are placed one by one, and cannot capture tigers.
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 mt-12 font-medium">
        Nepali Traditional Board Game • Built with React 19 & Tailwind CSS v4
      </footer>
    </div>
  );
};
export { HomePage as default };
