import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore.js';
import { Player, WinReason } from '@baghchal/shared';
import { Button } from '../ui/Button.js';
import { Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GameResult: React.FC = () => {
  const { gameState, mode, playerSide, resetGame } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);

  const result = gameState.result;

  useEffect(() => {
    if (result !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      
      // Fire confetti if a player won!
      if (result.winner !== null) {
        // Simple confetti fire
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);
      }
    } else {
      setIsOpen(false);
    }
  }, [result]);

  if (!isOpen || result === null) return null;

  const winnerName = result.winner === Player.Tiger ? 'Tigers' : 'Goats';
  const isHumanWinner = mode === 'AI' ? result.winner === playerSide : true;

  const getReasonText = () => {
    switch (result.reason) {
      case WinReason.GoatsCaptured:
        return 'Tigers captured 5 goats successfully.';
      case WinReason.TigersTrapped:
        return 'Goats successfully trapped all 4 tigers.';
      case WinReason.Resignation:
        return `${result.winner === Player.Tiger ? 'Goats' : 'Tigers'} resigned the match.`;
      case WinReason.Timeout:
        return 'Game ended due to time control limits.';
      case WinReason.DrawAgreed:
        return 'A draw was agreed upon by both players.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-sm w-full rounded-2xl glass-panel-glow border border-slate-700/60 p-8 text-center shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300">
        
        {/* Victory Icon / Decoration */}
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg
          ${result.winner !== null 
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-orange-500/20' 
            : 'bg-slate-800 text-slate-300 border border-slate-700 shadow-slate-950'
          }
        `}>
          {result.winner !== null ? <Trophy className="h-8 w-8 stroke-[2.5]" /> : '🤝'}
        </div>

        {/* Header Text */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-50">
            {result.winner !== null ? (
              <span>{winnerName} Victory!</span>
            ) : (
              <span>Match Draw</span>
            )}
          </h2>
          
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1.5">
            {mode === 'AI' ? (isHumanWinner ? '🎉 You won! 🎉' : '💀 AI wins! 💀') : 'Local Match'}
          </p>
        </div>

        {/* Reason Info */}
        <div className="w-full bg-slate-950/50 border border-slate-850 p-4 rounded-xl text-sm text-slate-300 leading-relaxed font-medium">
          {getReasonText()}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <Button
            variant="primary"
            onClick={() => {
              setIsOpen(false);
              resetGame();
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full"
          >
            Play Rematch
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Close Board
          </Button>
        </div>
      </div>
    </div>
  );
};
export { GameResult as default };
