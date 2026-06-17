/**
 * Game Engine Facade
 *
 * High-level API for the Baghchal game engine.
 * This is the primary entry point for game logic consumers.
 */

export { createInitialState, getPieceAt, getPieceAtIndex, isEmpty, isEmptyIndex, findPieces, countPieces, goatsOnBoard, goatsRemaining, getEmptyPositions, getNeighbors, cloneBoard, boardToString, posToNotation, indexToNotation } from './board.js';

export { getValidMoves, getGoatPlacements, getGoatMoves, getTigerMoves, getTigerCaptures, isValidMove, movesEqual, applyMove, countTigerMoves, getMovesForPiece } from './moves.js';

export { checkWinCondition, haveTigersWonByCapture, areTigersTrapped, isGameOver, withWinCheck } from './rules.js';

import { type GameState, type Move, type GameConfig } from '../types/game.js';
import { createInitialState } from './board.js';
import { applyMove, isValidMove } from './moves.js';
import { withWinCheck } from './rules.js';

/**
 * Create a new game with the given configuration.
 */
export function createGame(_config?: GameConfig): GameState {
  return createInitialState();
}

/**
 * Make a move in the game.
 * Validates the move, applies it, and checks win conditions.
 *
 * @throws Error if the move is invalid.
 */
export function makeMove(state: GameState, move: Move): GameState {
  if (!isValidMove(state, move)) {
    throw new Error(
      `Invalid move: ${move.player} ${move.type} ` +
      `${move.from ? `(${move.from.row},${move.from.col})` : '(placement)'} → ` +
      `(${move.to.row},${move.to.col})`
    );
  }

  const newState = applyMove(state, move);
  return withWinCheck(newState);
}

/**
 * Make a move without validation (for trusted sources like the AI engine).
 * Still applies win condition checks.
 */
export function makeMoveUnchecked(state: GameState, move: Move): GameState {
  const newState = applyMove(state, move);
  return withWinCheck(newState);
}
