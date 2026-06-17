/**
 * Move Generation & Validation
 *
 * All legal move generation for both players, including goat placement,
 * piece movement, and tiger captures with jump validation.
 */

import {
  type GameState,
  type Move,
  type Position,
  PieceType,
  Player,
  GamePhase,
  MoveType,
} from '../types/game.js';
import {
  TOTAL_POSITIONS,
  posToIndex,
  indexToPos,
  adjacencyList,
  jumpPaths,
} from '../constants/board.js';
import { TOTAL_GOATS } from '../constants/game.js';
import { cloneBoard } from './board.js';

// ─── Goat Moves ────────────────────────────────────────────────────────────

/**
 * Get all valid goat placements (Phase 1).
 * Goats can be placed on any empty intersection.
 */
export function getGoatPlacements(state: GameState): Move[] {
  if (state.phase !== GamePhase.Placement || state.currentPlayer !== Player.Goat) {
    return [];
  }

  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] === null) {
      moves.push({
        player: Player.Goat,
        type: MoveType.Place,
        from: null,
        to: indexToPos(i),
        captured: null,
      });
    }
  }
  return moves;
}

/**
 * Get all valid goat movements (Phase 2).
 * Goats can move to any adjacent empty intersection along a board line.
 */
export function getGoatMoves(state: GameState): Move[] {
  if (state.phase !== GamePhase.Movement || state.currentPlayer !== Player.Goat) {
    return [];
  }

  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Goat) continue;

    const fromPos = indexToPos(i);
    const neighbors = adjacencyList[i];

    for (const neighborIdx of neighbors) {
      if (state.board[neighborIdx] === null) {
        moves.push({
          player: Player.Goat,
          type: MoveType.Move,
          from: fromPos,
          to: indexToPos(neighborIdx),
          captured: null,
        });
      }
    }
  }
  return moves;
}

// ─── Tiger Moves ───────────────────────────────────────────────────────────

/**
 * Get all valid tiger moves (both phases).
 * Tigers can:
 *   1. Move to any adjacent empty intersection along a board line.
 *   2. Capture by jumping over an adjacent goat to an empty space beyond.
 */
export function getTigerMoves(state: GameState): Move[] {
  if (state.currentPlayer !== Player.Tiger) {
    return [];
  }

  const moves: Move[] = [];

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Tiger) continue;

    const fromPos = indexToPos(i);

    // 1. Simple moves to adjacent empty positions
    const neighbors = adjacencyList[i];
    for (const neighborIdx of neighbors) {
      if (state.board[neighborIdx] === null) {
        moves.push({
          player: Player.Tiger,
          type: MoveType.Move,
          from: fromPos,
          to: indexToPos(neighborIdx),
          captured: null,
        });
      }
    }

    // 2. Capture moves (jump over goat)
    const jumps = jumpPaths[i];
    for (const jump of jumps) {
      if (state.board[jump.over] === PieceType.Goat && state.board[jump.land] === null) {
        moves.push({
          player: Player.Tiger,
          type: MoveType.Capture,
          from: fromPos,
          to: indexToPos(jump.land),
          captured: indexToPos(jump.over),
        });
      }
    }
  }

  return moves;
}

/**
 * Get all valid tiger captures only (used by AI for quiescence search).
 */
export function getTigerCaptures(state: GameState): Move[] {
  if (state.currentPlayer !== Player.Tiger) return [];

  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Tiger) continue;

    const fromPos = indexToPos(i);
    const jumps = jumpPaths[i];
    for (const jump of jumps) {
      if (state.board[jump.over] === PieceType.Goat && state.board[jump.land] === null) {
        moves.push({
          player: Player.Tiger,
          type: MoveType.Capture,
          from: fromPos,
          to: indexToPos(jump.land),
          captured: indexToPos(jump.over),
        });
      }
    }
  }
  return moves;
}

// ─── Combined ──────────────────────────────────────────────────────────────

/**
 * Get all valid moves for the current player.
 */
export function getValidMoves(state: GameState): Move[] {
  if (state.result !== null) return [];

  if (state.currentPlayer === Player.Goat) {
    if (state.phase === GamePhase.Placement) {
      return getGoatPlacements(state);
    }
    return getGoatMoves(state);
  }

  return getTigerMoves(state);
}

/**
 * Check if a specific move is valid.
 */
export function isValidMove(state: GameState, move: Move): boolean {
  // Quick validation
  if (state.result !== null) return false;
  if (move.player !== state.currentPlayer) return false;

  const validMoves = getValidMoves(state);
  return validMoves.some(m => movesEqual(m, move));
}

/**
 * Check if two moves are equivalent.
 */
export function movesEqual(a: Move, b: Move): boolean {
  if (a.player !== b.player || a.type !== b.type) return false;
  if (a.to.row !== b.to.row || a.to.col !== b.to.col) return false;

  if (a.from === null && b.from === null) return true;
  if (a.from === null || b.from === null) return false;
  if (a.from.row !== b.from.row || a.from.col !== b.from.col) return false;

  if (a.captured === null && b.captured === null) return true;
  if (a.captured === null || b.captured === null) return false;
  return a.captured.row === b.captured.row && a.captured.col === b.captured.col;
}

// ─── Move Application ──────────────────────────────────────────────────────

/**
 * Apply a move to the game state and return a new state.
 * Does NOT validate the move — call isValidMove first if needed.
 *
 * This is the authoritative state transition function.
 */
export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = cloneBoard(state.board);
  let newGoatsPlaced = state.goatsPlaced;
  let newGoatsCaptured = state.goatsCaptured;

  switch (move.type) {
    case MoveType.Place:
      // Place a goat on the board
      newBoard[posToIndex(move.to)] = PieceType.Goat;
      newGoatsPlaced++;
      break;

    case MoveType.Move:
      // Move a piece from one position to another
      newBoard[posToIndex(move.to)] = newBoard[posToIndex(move.from!)];
      newBoard[posToIndex(move.from!)] = null;
      break;

    case MoveType.Capture:
      // Tiger jumps over goat
      newBoard[posToIndex(move.to)] = newBoard[posToIndex(move.from!)];
      newBoard[posToIndex(move.from!)] = null;
      newBoard[posToIndex(move.captured!)] = null;
      newGoatsCaptured++;
      break;
  }

  // Determine next phase
  const newPhase = newGoatsPlaced >= TOTAL_GOATS ? GamePhase.Movement : GamePhase.Placement;

  // Switch turns
  const nextPlayer = state.currentPlayer === Player.Goat ? Player.Tiger : Player.Goat;

  const newMoveCount = state.moveCount + 1;

  const newState: GameState = {
    board: newBoard,
    currentPlayer: nextPlayer,
    phase: newPhase,
    goatsPlaced: newGoatsPlaced,
    goatsCaptured: newGoatsCaptured,
    moveHistory: [...state.moveHistory, move],
    result: null,
    moveCount: newMoveCount,
  };

  return newState;
}

/**
 * Get the count of valid moves for tigers in a given state.
 * Used for checking if tigers are trapped.
 */
export function countTigerMoves(state: GameState): number {
  let count = 0;

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Tiger) continue;

    // Simple moves
    const neighbors = adjacencyList[i];
    for (const neighborIdx of neighbors) {
      if (state.board[neighborIdx] === null) count++;
    }

    // Capture moves
    const jumps = jumpPaths[i];
    for (const jump of jumps) {
      if (state.board[jump.over] === PieceType.Goat && state.board[jump.land] === null) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Get valid moves for a specific piece at a given position.
 * Used by the UI to highlight available moves for a selected piece.
 */
export function getMovesForPiece(state: GameState, pos: Position): Move[] {
  if (state.result !== null) return [];

  const idx = posToIndex(pos);
  const piece = state.board[idx];
  if (piece === null) return [];

  // Only current player's pieces can move
  if (piece === PieceType.Tiger && state.currentPlayer !== Player.Tiger) return [];
  if (piece === PieceType.Goat && state.currentPlayer !== Player.Goat) return [];

  // In placement phase, goats can only be placed, not moved
  if (piece === PieceType.Goat && state.phase === GamePhase.Placement) return [];

  const moves: Move[] = [];

  if (piece === PieceType.Goat) {
    // Goat simple moves
    const neighbors = adjacencyList[idx];
    for (const neighborIdx of neighbors) {
      if (state.board[neighborIdx] === null) {
        moves.push({
          player: Player.Goat,
          type: MoveType.Move,
          from: pos,
          to: indexToPos(neighborIdx),
          captured: null,
        });
      }
    }
  } else {
    // Tiger simple moves
    const neighbors = adjacencyList[idx];
    for (const neighborIdx of neighbors) {
      if (state.board[neighborIdx] === null) {
        moves.push({
          player: Player.Tiger,
          type: MoveType.Move,
          from: pos,
          to: indexToPos(neighborIdx),
          captured: null,
        });
      }
    }

    // Tiger captures
    const jumps = jumpPaths[idx];
    for (const jump of jumps) {
      if (state.board[jump.over] === PieceType.Goat && state.board[jump.land] === null) {
        moves.push({
          player: Player.Tiger,
          type: MoveType.Capture,
          from: pos,
          to: indexToPos(jump.land),
          captured: indexToPos(jump.over),
        });
      }
    }
  }

  return moves;
}
