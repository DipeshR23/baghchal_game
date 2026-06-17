/**
 * Baghchal Board Topology
 *
 * The board is a 5×5 grid with 25 intersections. Pieces sit on intersections
 * and move along the lines connecting them.
 *
 * Coordinate system:
 *   - Row 0 = top, Row 4 = bottom
 *   - Col 0 = left, Col 4 = right
 *
 * Diagonal connections exist only at positions where (row + col) is even.
 * This creates the traditional Baghchal diamond pattern:
 *
 *   (0,0)---(0,1)---(0,2)---(0,3)---(0,4)
 *     |\      |      /|\      |      /|
 *     | \     |     / | \     |     / |
 *     |  \    |    /  |  \    |    /  |
 *   (1,0)---(1,1)---(1,2)---(1,3)---(1,4)
 *     |  /    |    \  |  /    |    \  |
 *     | /     |     \ | /     |     \ |
 *     |/      |      \|/      |      \|
 *   (2,0)---(2,1)---(2,2)---(2,3)---(2,4)
 *     |\      |      /|\      |      /|
 *     | \     |     / | \     |     / |
 *     |  \    |    /  |  \    |    /  |
 *   (3,0)---(3,1)---(3,2)---(3,3)---(3,4)
 *     |  /    |    \  |  /    |    \  |
 *     | /     |     \ | /     |     \ |
 *     |/      |      \|/      |      \|
 *   (4,0)---(4,1)---(4,2)---(4,3)---(4,4)
 */

import type { Position } from '../types/game.js';

/** Board dimensions. */
export const BOARD_SIZE = 5;

/** Total intersections on the board. */
export const TOTAL_POSITIONS = BOARD_SIZE * BOARD_SIZE;

/** Convert (row, col) to a flat index. */
export function posToIndex(pos: Position): number {
  return pos.row * BOARD_SIZE + pos.col;
}

/** Convert flat index to (row, col). */
export function indexToPos(index: number): Position {
  return {
    row: Math.floor(index / BOARD_SIZE),
    col: index % BOARD_SIZE,
  };
}

/** Check if a position is within board bounds. */
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

/** Check if two positions are the same. */
export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Whether a position has diagonal connections.
 * In traditional Baghchal, diagonals exist where (row + col) is even.
 */
export function hasDiagonals(pos: Position): boolean {
  return (pos.row + pos.col) % 2 === 0;
}

/**
 * Direction vectors for movement.
 * Orthogonal directions are always available.
 * Diagonal directions are only available at "even" positions.
 */
export const ORTHOGONAL_DIRS: ReadonlyArray<Position> = [
  { row: -1, col: 0 },  // up
  { row: 1, col: 0 },   // down
  { row: 0, col: -1 },  // left
  { row: 0, col: 1 },   // right
];

export const DIAGONAL_DIRS: ReadonlyArray<Position> = [
  { row: -1, col: -1 }, // up-left
  { row: -1, col: 1 },  // up-right
  { row: 1, col: -1 },  // down-left
  { row: 1, col: 1 },   // down-right
];

export const ALL_DIRS: ReadonlyArray<Position> = [...ORTHOGONAL_DIRS, ...DIAGONAL_DIRS];

/**
 * Get all directions available from a given position.
 * Positions where (row+col) is even have 8 directions; others have 4.
 */
export function getDirections(pos: Position): ReadonlyArray<Position> {
  return hasDiagonals(pos) ? ALL_DIRS : ORTHOGONAL_DIRS;
}

/**
 * Pre-computed adjacency list for the entire board.
 * adjacencyList[index] = array of adjacent position indices.
 *
 * Built once at module load for O(1) lookup during gameplay.
 */
export const adjacencyList: ReadonlyArray<ReadonlyArray<number>> = buildAdjacencyList();

function buildAdjacencyList(): number[][] {
  const adj: number[][] = new Array(TOTAL_POSITIONS);

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    const pos = indexToPos(i);
    const dirs = getDirections(pos);
    const neighbors: number[] = [];

    for (const dir of dirs) {
      const neighbor: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
      if (isValidPosition(neighbor)) {
        neighbors.push(posToIndex(neighbor));
      }
    }

    adj[i] = neighbors;
  }

  return adj;
}

/**
 * Pre-computed jump paths for tiger captures.
 * jumpPaths[tigerIndex] = array of { over: goatIndex, land: landingIndex }
 *
 * A tiger at `tigerIndex` can capture a goat at `over` if `over` has a goat
 * and `land` is empty. The jump must follow a straight line on the board.
 */
export interface JumpPath {
  readonly over: number;
  readonly land: number;
  readonly direction: Position;
}

export const jumpPaths: ReadonlyArray<ReadonlyArray<JumpPath>> = buildJumpPaths();

function buildJumpPaths(): JumpPath[][] {
  const paths: JumpPath[][] = new Array(TOTAL_POSITIONS);

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    const pos = indexToPos(i);
    const dirs = getDirections(pos);
    const jumps: JumpPath[] = [];

    for (const dir of dirs) {
      const over: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
      const land: Position = { row: pos.row + dir.row * 2, col: pos.col + dir.col * 2 };

      if (isValidPosition(over) && isValidPosition(land)) {
        // The jump must follow a line that exists on the board.
        // The "over" position must be adjacent to the tiger (already guaranteed by direction).
        // The "land" position must be adjacent to the "over" position in the same direction.
        // Check that the over→land connection exists on the board.
        const overIndex = posToIndex(over);
        const landIndex = posToIndex(land);

        // Verify the over→land direction is valid on the board.
        // The over position must support this direction.
        const overDirs = getDirections(over);
        const dirIsValid = overDirs.some(d => d.row === dir.row && d.col === dir.col);

        if (dirIsValid) {
          jumps.push({ over: overIndex, land: landIndex, direction: dir });
        }
      }
    }

    paths[i] = jumps;
  }

  return paths;
}

/**
 * The four corner positions where tigers start.
 */
export const TIGER_START_POSITIONS: ReadonlyArray<Position> = [
  { row: 0, col: 0 },
  { row: 0, col: 4 },
  { row: 4, col: 0 },
  { row: 4, col: 4 },
];

export const TIGER_START_INDICES: ReadonlyArray<number> = TIGER_START_POSITIONS.map(posToIndex);

/** Center position — the most powerful position on the board. */
export const CENTER_POSITION: Position = { row: 2, col: 2 };
export const CENTER_INDEX: number = posToIndex(CENTER_POSITION);

/**
 * Position importance weights for AI evaluation.
 * Center is most valuable, corners next, edges least.
 */
export const POSITION_WEIGHTS: ReadonlyArray<number> = [
  3, 1, 3, 1, 3,
  1, 4, 2, 4, 1,
  3, 2, 5, 2, 3,
  1, 4, 2, 4, 1,
  3, 1, 3, 1, 3,
];
