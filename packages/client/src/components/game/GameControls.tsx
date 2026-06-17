import React from 'react';
import { useGameStore } from '../../stores/gameStore.js';
import { Button } from '../ui/Button.js';
import { RotateCcw, Undo2, Redo2, Flag } from 'lucide-react';
import { GameMode, WinReason, Player } from '@baghchal/shared';

export const GameControls: React.FC = () => {
  const {
    gameState,
    mode,
    history,
    historyIndex,
    undo,
    redo,
    resetGame,
    playerSide,
  } = useGameStore();

  const isGameOver = gameState.result !== null;
  
  // Can undo?
  // Local: index > 0
  // AI: index >= 2 (since AI plays immediately, we must have at least 2 states: initial + user + AI)
  // Wait, if AI is Tiger, the first state is index 0. Then user moves, AI moves.
  // Actually, let's just enable undo if historyIndex > 0 in local, or historyIndex > 1 in AI mode.
  const canUndo = mode === GameMode.AI 
    ? historyIndex > 0 
    : historyIndex > 0;

  const canRedo = historyIndex < history.length - 1;

  const handleResign = () => {
    if (isGameOver) return;
    
    // Set result to resignation
    const opponent = playerSide === Player.Goat ? Player.Tiger : Player.Goat;
    
    useGameStore.setState({
      gameState: {
        ...gameState,
        result: {
          winner: opponent,
          reason: WinReason.Resignation,
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      <Button
        variant="secondary"
        onClick={undo}
        disabled={!canUndo || isGameOver}
        leftIcon={<Undo2 className="h-4 w-4" />}
        size="sm"
        className="w-full flex-col py-2.5 h-auto text-[10px]"
      >
        Undo
      </Button>

      <Button
        variant="secondary"
        onClick={redo}
        disabled={!canRedo || isGameOver}
        leftIcon={<Redo2 className="h-4 w-4" />}
        size="sm"
        className="w-full flex-col py-2.5 h-auto text-[10px]"
      >
        Redo
      </Button>

      <Button
        variant="secondary"
        onClick={resetGame}
        leftIcon={<RotateCcw className="h-4 w-4" />}
        size="sm"
        className="w-full flex-col py-2.5 h-auto text-[10px]"
      >
        Restart
      </Button>

      <Button
        variant="danger"
        onClick={handleResign}
        disabled={isGameOver || mode === null}
        leftIcon={<Flag className="h-4 w-4" />}
        size="sm"
        className="w-full flex-col py-2.5 h-auto text-[10px]"
      >
        Resign
      </Button>
    </div>
  );
};
export { GameControls as default };
