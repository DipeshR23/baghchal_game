/**
 * Zobrist Hashing for Baghchal
 *
 * Generates unique hash keys for board positions using XOR of
 * pre-computed random values. Enables O(1) incremental hash
 * updates when pieces are placed, moved, or captured.
 */

import { PieceType } from '../types/game.js';
import { TOTAL_POSITIONS } from '../constants/board.js';

/**
 * We use two 32-bit numbers to represent a 64-bit hash
 * since JavaScript doesn't natively support 64-bit integers
 * with bitwise operations.
 */
export interface ZobristHash {
  readonly lo: number;
  readonly hi: number;
}

/** Pseudo-random number generator (xorshift32) for deterministic hash keys. */
class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state = x;
    return x >>> 0; // Convert to unsigned 32-bit
  }
}

// Pre-compute random values for each (position, piece) combination.
// Index: position * 2 + pieceIndex (0 = Tiger, 1 = Goat)
const HASH_TABLE_SIZE = TOTAL_POSITIONS * 2; // 25 positions × 2 piece types

const hashKeysLo: Int32Array = new Int32Array(HASH_TABLE_SIZE);
const hashKeysHi: Int32Array = new Int32Array(HASH_TABLE_SIZE);

// Turn hash — XOR'd when it's tiger's turn
let turnHashLo: number;
let turnHashHi: number;

// Initialize with deterministic random values
function initializeHashKeys(): void {
  const rng = new PRNG(0xBAD_C4A1); // Deterministic seed ("BAGHCHAL"-ish)

  for (let i = 0; i < HASH_TABLE_SIZE; i++) {
    hashKeysLo[i] = rng.next();
    hashKeysHi[i] = rng.next();
  }

  turnHashLo = rng.next();
  turnHashHi = rng.next();
}

initializeHashKeys();

/** Get the piece index for hashing (Tiger=0, Goat=1). */
function pieceIndex(piece: PieceType): number {
  return piece === PieceType.Tiger ? 0 : 1;
}

/** Get the hash table key for a (position, piece) pair. */
function hashKey(position: number, piece: PieceType): number {
  return position * 2 + pieceIndex(piece);
}

/** Compute the full Zobrist hash for a board state from scratch. */
export function computeHash(
  board: ReadonlyArray<PieceType | null>,
  isTigerTurn: boolean
): ZobristHash {
  let lo = 0;
  let hi = 0;

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    const piece = board[i];
    if (piece !== null) {
      const key = hashKey(i, piece);
      lo ^= hashKeysLo[key];
      hi ^= hashKeysHi[key];
    }
  }

  if (isTigerTurn) {
    lo ^= turnHashLo;
    hi ^= turnHashHi;
  }

  return { lo, hi };
}

/** XOR a piece placement/removal into an existing hash. */
export function togglePiece(hash: ZobristHash, position: number, piece: PieceType): ZobristHash {
  const key = hashKey(position, piece);
  return {
    lo: hash.lo ^ hashKeysLo[key],
    hi: hash.hi ^ hashKeysHi[key],
  };
}

/** Toggle the turn indicator in the hash. */
export function toggleTurn(hash: ZobristHash): ZobristHash {
  return {
    lo: hash.lo ^ turnHashLo,
    hi: hash.hi ^ turnHashHi,
  };
}

/** Combine hash parts into a single number for table indexing. */
export function hashToIndex(hash: ZobristHash, tableSize: number): number {
  // Use the lower bits, masked to table size (must be power of 2)
  return (hash.lo >>> 0) % tableSize;
}

/** Check if two hashes are equal. */
export function hashEqual(a: ZobristHash, b: ZobristHash): boolean {
  return a.lo === b.lo && a.hi === b.hi;
}

export const EMPTY_HASH: ZobristHash = { lo: 0, hi: 0 };
