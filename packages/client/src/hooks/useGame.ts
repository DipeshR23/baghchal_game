import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore.js';
import { useSound } from './useSound.js';
import { MoveType, GameMode, type GameState } from '@baghchal/shared';

export const useGame = () => {
  const { gameState, mode, playerSide } = useGameStore();
  const { playMoveSound, playCaptureSound, playVictorySound, playDefeatSound } = useSound();
  
  const prevMoveCount = useRef(0);
  const prevResult = useRef<GameState['result']>(null);

  useEffect(() => {
    const moves = gameState.moveHistory;
    const currentCount = moves.length;

    // Trigger sounds for moves
    if (currentCount > prevMoveCount.current) {
      const lastMove = moves[currentCount - 1];
      if (lastMove.type === MoveType.Capture) {
        playCaptureSound();
      } else {
        playMoveSound();
      }
    }
    prevMoveCount.current = currentCount;

    // Trigger sounds for game end
    if (gameState.result !== null && prevResult.current === null) {
      if (gameState.result.winner !== null) {
        if (mode === GameMode.AI) {
          if (gameState.result.winner === playerSide) {
            playVictorySound();
          } else {
            playDefeatSound();
          }
        } else {
          playVictorySound();
        }
      }
    }
    prevResult.current = gameState.result;
  }, [
    gameState.moveHistory,
    gameState.result,
    mode,
    playerSide,
    playMoveSound,
    playCaptureSound,
    playVictorySound,
    playDefeatSound,
  ]);

  return {
    gameState,
    mode,
    playerSide,
  };
};
export { useGame as default };
