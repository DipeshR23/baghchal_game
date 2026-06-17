import React from 'react';
import { useGameStore } from '../../stores/gameStore.js';
import { Player, GamePhase } from '@baghchal/shared';
import { Badge } from '../ui/Badge.js';

export const GameInfo: React.FC = () => {
  const { gameState, mode, aiLevel, playerSide, isAILoading } = useGameStore();

  const isTigerTurn = gameState.currentPlayer === Player.Tiger;
  const isGoatTurn = gameState.currentPlayer === Player.Goat;

  // Render info for Tiger Player
  const renderTigerPlayer = () => {
    const isTigerAI = mode === 'AI' && playerSide === Player.Goat;
    const isActive = isTigerTurn && gameState.result === null;

    return (
      <div 
        className={`
          flex items-center justify-between p-4 rounded-xl border transition-all duration-300
          ${isActive 
            ? 'border-orange-500/40 bg-orange-950/20 pulse-turn-tiger' 
            : 'border-slate-800/80 bg-slate-900/20'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md">
            🐅
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Tigers</span>
              {isTigerAI ? (
                <Badge variant="primary">AI (Lvl {aiLevel})</Badge>
              ) : (
                <Badge variant="secondary">Player</Badge>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {isTigerAI && isAILoading && isActive ? 'AI is thinking...' : '4 Tigers on board'}
            </div>
          </div>
        </div>
        {isActive && (
          <span className="text-xs font-bold text-orange-500 animate-pulse tracking-wider">
            THINKING...
          </span>
        )}
      </div>
    );
  };

  // Render info for Goat Player
  const renderGoatPlayer = () => {
    const isGoatAI = mode === 'AI' && playerSide === Player.Tiger;
    const isActive = isGoatTurn && gameState.result === null;
    const goatsLeft = 20 - gameState.goatsPlaced;

    return (
      <div 
        className={`
          flex items-center justify-between p-4 rounded-xl border transition-all duration-300
          ${isActive 
            ? 'border-slate-400/40 bg-slate-800/20 pulse-turn-goat' 
            : 'border-slate-800/80 bg-slate-900/20'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 flex items-center justify-center font-bold text-slate-900 text-lg shadow-md">
            🐐
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Goats</span>
              {isGoatAI ? (
                <Badge variant="info">AI (Lvl {aiLevel})</Badge>
              ) : (
                <Badge variant="secondary">Player</Badge>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {gameState.phase === GamePhase.Placement ? (
                <span>Placing: {gameState.goatsPlaced}/20 ({goatsLeft} left)</span>
              ) : (
                <span>Movement Phase ({20 - gameState.goatsCaptured} alive)</span>
              )}
            </div>
          </div>
        </div>
        {isActive && (
          <span className="text-xs font-bold text-slate-300 animate-pulse tracking-wider">
            {isGoatAI && isAILoading ? 'THINKING...' : 'YOUR TURN'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Turn & Phase Badges */}
      <div className="flex justify-between items-center px-1">
        <div className="text-sm font-bold text-slate-400">
          Phase:{' '}
          <span className="text-slate-200">
            {gameState.phase === GamePhase.Placement ? 'Placement 📥' : 'Movement 🏃'}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Move {gameState.moveHistory.length + 1}
        </div>
      </div>

      {/* Players */}
      <div className="flex flex-col gap-2">
        {renderTigerPlayer()}
        {renderGoatPlayer()}
      </div>
    </div>
  );
};
export { GameInfo as default };
