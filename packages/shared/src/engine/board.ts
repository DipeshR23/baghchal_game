/**
 * Board State Management
 *
 * Pure functions for creating and querying board state.
 * All functions are side-effect free and return new objects.
 */

import { type GameState, type Position, PieceType, Player, GamePhase } from '../types/game.js';
import {
  BOARD_SIZE,
  TOTAL_POSITIONS,
  TIGER_START_INDICES,
  posToIndex,
  indexToPos,
  adjacencyList,
  jumpPaths,
} from '../constants/board.js';
import { TOTAL_GOATS } from '../constants/game.js';

/**
 * Create the initial game state.
 * Tigers are placed in the four corners; the rest is empty.
 * Goat player moves first.
 */
export function createInitialState(): GameState {
  const board: (PieceType | null)[] = new Array(TOTAL_POSITIONS).fill(null);

  // Place tigers in corners
  for (const idx of TIGER_START_INDICES) {
    board[idx] = PieceType.Tiger;
  }

  return {
    board,
    currentPlayer: Player.Goat,
    phase: GamePhase.Placement,
    goatsPlaced: 0,
    goatsCaptured: 0,
    moveHistory: [],
    result: null,
    moveCount: 0,
  };
}

/** Get the piece at a given position, or null if empty. */
export function getPieceAt(state: GameState, pos: Position): PieceType | null {
  return state.board[posToIndex(pos)];
}

/** Get the piece at a given index, or null if empty. */
export function getPieceAtIndex(state: GameState, index: number): PieceType | null {
  return state.board[index];
}

/** Check if a position is empty. */
export function isEmpty(state: GameState, pos: Position): boolean {
  return state.board[posToIndex(pos)] === null;
}

/** Check if a position index is empty. */
export function isEmptyIndex(state: GameState, index: number): boolean {
  return state.board[index] === null;
}

/** Get all positions occupied by a given piece type. */
export function findPieces(state: GameState, pieceType: PieceType): number[] {
  const positions: number[] = [];
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] === pieceType) {
      positions.push(i);
    }
  }
  return positions;
}

/** Count pieces of a given type on the board. */
export function countPieces(state: GameState, pieceType: PieceType): number {
  let count = 0;
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] === pieceType) count++;
  }
  return count;
}

/** Get the number of goats currently on the board (placed - captured). */
export function goatsOnBoard(state: GameState): number {
  return state.goatsPlaced - state.goatsCaptured;
}

/** Get the number of goats remaining to be placed. */
export function goatsRemaining(state: GameState): number {
  return TOTAL_GOATS - state.goatsPlaced;
}

/** Get all empty positions on the board. */
export function getEmptyPositions(state: GameState): number[] {
  const empty: number[] = [];
  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] === null) {
      empty.push(i);
    }
  }
  return empty;
}

/** Get all neighbor indices for a given position index. */
export function getNeighbors(index: number): ReadonlyArray<number> {
  return adjacencyList[index];
}

/** Get all jump paths from a given position index. */
export function getJumpPaths(index: number): ReadonlyArray<typeof jumpPaths[number][number]> {
  return jumpPaths[index];
}

/** Clone a board array for mutation. */
export function cloneBoard(board: ReadonlyArray<PieceType | null>): (PieceType | null)[] {
  return [...board];
}

/** Pretty-print the board state for debugging. */
export function boardToString(state: GameState): string {
  const lines: string[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const cells: string[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = state.board[row * BOARD_SIZE + col];
      if (piece === PieceType.Tiger) cells.push('T');
      else if (piece === PieceType.Goat) cells.push('G');
      else cells.push('·');
    }
    lines.push(cells.join(' '));
  }
  lines.push(`Turn: ${state.currentPlayer} | Phase: ${state.phase}`);
  lines.push(`Goats Placed: ${state.goatsPlaced}/${TOTAL_GOATS} | Captured: ${state.goatsCaptured}`);
  return lines.join('\n');
}

/**
 * Convert Position to algebraic notation (e.g., a1, c3, e5).
 * Column a-e, Row 1-5 (from bottom).
 */
export function posToNotation(pos: Position): string {
  const col = String.fromCharCode(97 + pos.col); // a-e
  const row = (BOARD_SIZE - pos.row).toString();  // 5-1
  return `${col}${row}`;
}

/** Convert index to algebraic notation. */
export function indexToNotation(index: number): string {
  return posToNotation(indexToPos(index));
}
