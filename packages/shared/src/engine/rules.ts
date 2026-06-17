/**
 * Game Rules — Win Condition Checking
 *
 * Determines if the game is over and who won.
 */

import {
  type GameState,
  type GameResult,
  Player,
  WinReason,
} from '../types/game.js';
import { GOATS_TO_CAPTURE, MAX_MOVES } from '../constants/game.js';
import { countTigerMoves } from './moves.js';

/**
 * Check if the tiger player has won by capturing enough goats.
 */
export function haveTigersWonByCapture(state: GameState): boolean {
  return state.goatsCaptured >= GOATS_TO_CAPTURE;
}

/**
 * Check if all tigers are trapped (no legal moves).
 * This is checked ONLY when it's the tiger's turn.
 */
export function areTigersTrapped(state: GameState): boolean {
  return countTigerMoves(state) === 0;
}

/**
 * Check the win condition and return a GameResult if the game is over.
 * Returns null if the game is still in progress.
 *
 * Called AFTER a move is applied (the current player has already switched).
 */
export function checkWinCondition(state: GameState): GameResult | null {
  // Tiger wins by capturing 5 goats
  if (haveTigersWonByCapture(state)) {
    return {
      winner: Player.Tiger,
      reason: WinReason.GoatsCaptured,
    };
  }

  // Goat wins if all tigers are trapped and it's tiger's turn
  if (state.currentPlayer === Player.Tiger && areTigersTrapped(state)) {
    return {
      winner: Player.Goat,
      reason: WinReason.TigersTrapped,
    };
  }

  // Draw by move limit (prevents infinite games)
  if (state.moveCount >= MAX_MOVES) {
    return {
      winner: null,
      reason: WinReason.DrawAgreed,
    };
  }

  return null;
}

/**
 * Check if the game is over.
 */
export function isGameOver(state: GameState): boolean {
  return state.result !== null;
}

/**
 * Apply win condition check to a state and return updated state.
 * This should be called after every move application.
 */
export function withWinCheck(state: GameState): GameState {
  if (state.result !== null) return state;

  const result = checkWinCondition(state);
  if (result === null) return state;

  return {
    ...state,
    result,
  };
}
