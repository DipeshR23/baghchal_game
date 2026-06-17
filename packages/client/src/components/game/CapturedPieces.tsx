import React from 'react';
import { useGameStore } from '../../stores/gameStore.js';

export const CapturedPieces: React.FC = () => {
  const { gameState } = useGameStore();
  const capturedCount = gameState.goatsCaptured;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Tigers' Goal (Captures)
        </span>
        <span className="text-sm font-bold text-red-400">
          {capturedCount} / 5
        </span>
      </div>
      
      {/* 5 Slots representing captured goats */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => {
          const isCaptured = index < capturedCount;
          return (
            <div
              key={index}
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300
                ${isCaptured 
                  ? 'bg-red-500/10 border-red-500/40 text-red-500 scale-105 shadow-md shadow-red-500/10' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }
              `}
            >
              <svg viewBox="0 0 24 24" className="w-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                {/* Simplified Goat Head Icon */}
                <path d="M12 4c-2 0-3 1.5-3.5 3.5C8 9.5 8.5 11 9 12l2 6h2l2-6c.5-1 1-2.5.5-4.5C15 5.5 14 4 12 4z" />
                <path d="M7 8c-1.5-1-2.5.5-2.5 2 0 1 .5 2 1.5 2.5" />
                <path d="M17 8c1.5-1 2.5.5 2.5 2 0 1-.5 2-1.5 2.5" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export { CapturedPieces as default };
