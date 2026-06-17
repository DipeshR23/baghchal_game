import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore.js';
import { type Move, MoveType, Player, posToNotation } from '@baghchal/shared';

export const MoveHistory: React.FC = () => {
  const { gameState } = useGameStore();
  const moves = gameState.moveHistory;
  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new moves
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Format move to standard notation
  const formatMove = (move: Move) => {
    const isTiger = move.player === Player.Tiger;
    const symbol = isTiger ? '🐅' : '🐐';
    
    if (move.type === MoveType.Place) {
      return `${symbol} +${posToNotation(move.to)}`;
    }
    
    if (move.type === MoveType.Capture) {
      return `${symbol} ${posToNotation(move.from!)}x${posToNotation(move.to)}`;
    }
    
    return `${symbol} ${posToNotation(move.from!)}-${posToNotation(move.to)}`;
  };

  // Group moves into pairs (turns)
  const pairedMoves: { round: number; goat: Move; tiger?: Move }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairedMoves.push({
      round: Math.floor(i / 2) + 1,
      goat: moves[i],
      tiger: moves[i + 1] ? moves[i + 1] : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full min-h-[160px] rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md overflow-hidden">
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-850 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Move Log
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {moves.length} ply
        </span>
      </div>

      <div 
        ref={listRef}
        className="flex-grow overflow-y-auto p-4 flex flex-col gap-1.5 text-sm scroll-smooth"
      >
        {pairedMoves.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6">
            No moves made yet
          </div>
        ) : (
          pairedMoves.map((pair) => (
            <div 
              key={pair.round} 
              className="grid grid-cols-12 gap-2 py-0.5 border-b border-slate-800/20 last:border-0 hover:bg-slate-850/20 px-1 rounded transition-colors"
            >
              <div className="col-span-2 text-slate-500 font-mono text-xs text-right pr-2">
                {pair.round}.
              </div>
              <div className="col-span-5 text-slate-200 font-medium font-mono text-xs flex items-center gap-1.5">
                {formatMove(pair.goat)}
              </div>
              <div className="col-span-5 text-orange-400 font-medium font-mono text-xs flex items-center gap-1.5">
                {pair.tiger ? formatMove(pair.tiger) : <span className="text-slate-600">...</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export { MoveHistory as default };
