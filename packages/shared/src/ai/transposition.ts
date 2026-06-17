/**
 * Transposition Table
 *
 * Fixed-size hash table that caches evaluated positions to avoid
 * redundant search in the minimax tree. Uses Zobrist hashing for
 * position identification.
 */

import { type Move } from '../types/game.js';
import { type ZobristHash, hashToIndex, hashEqual } from './zobrist.js';

/** The type of score stored in the transposition table. */
export enum TTFlag {
  /** Exact score (PV node). */
  Exact = 0,
  /** Lower bound (fail-high / beta cutoff). */
  LowerBound = 1,
  /** Upper bound (fail-low / alpha not raised). */
  UpperBound = 2,
}

/** A single entry in the transposition table. */
export interface TTEntry {
  hash: ZobristHash;
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove: Move | null;
  age: number; // Generation counter for replacement
}

/**
 * Transposition Table implementation.
 *
 * Uses a fixed-size array with a replacement policy that prefers
 * deeper searches and newer entries.
 */
export class TranspositionTable {
  private entries: (TTEntry | null)[];
  private size: number;
  private generation: number;
  private hits: number;
  private misses: number;
  private stores: number;
  private collisions: number;

  constructor(sizeInEntries: number = 1 << 20) { // Default ~1M entries
    this.size = sizeInEntries;
    this.entries = new Array(this.size).fill(null);
    this.generation = 0;
    this.hits = 0;
    this.misses = 0;
    this.stores = 0;
    this.collisions = 0;
  }

  /**
   * Look up a position in the table.
   * Returns the entry if found and hash matches, null otherwise.
   */
  probe(hash: ZobristHash): TTEntry | null {
    const index = hashToIndex(hash, this.size);
    const entry = this.entries[index];

    if (entry !== null && hashEqual(entry.hash, hash)) {
      this.hits++;
      return entry;
    }

    this.misses++;
    return null;
  }

  /**
   * Store a position evaluation in the table.
   * Uses depth-preferred replacement with age tiebreaker.
   */
  store(
    hash: ZobristHash,
    depth: number,
    score: number,
    flag: TTFlag,
    bestMove: Move | null
  ): void {
    const index = hashToIndex(hash, this.size);
    const existing = this.entries[index];

    // Replacement policy:
    // 1. Always replace if slot is empty
    // 2. Always replace if existing entry is from an older generation
    // 3. Replace if new entry has equal or greater depth
    if (
      existing === null ||
      existing.age < this.generation ||
      depth >= existing.depth
    ) {
      if (existing !== null && !hashEqual(existing.hash, hash)) {
        this.collisions++;
      }

      this.entries[index] = {
        hash,
        depth,
        score,
        flag,
        bestMove,
        age: this.generation,
      };

      this.stores++;
    }
  }

  /** Increment the generation counter. Called at the start of each new search. */
  newGeneration(): void {
    this.generation++;
  }

  /** Clear all entries. */
  clear(): void {
    this.entries.fill(null);
    this.generation = 0;
    this.hits = 0;
    this.misses = 0;
    this.stores = 0;
    this.collisions = 0;
  }

  /** Get statistics about table usage. */
  getStats(): {
    hits: number;
    misses: number;
    stores: number;
    collisions: number;
    hitRate: number;
    fillRate: number;
  } {
    const totalProbes = this.hits + this.misses;
    let filled = 0;
    for (let i = 0; i < this.size; i++) {
      if (this.entries[i] !== null) filled++;
    }

    return {
      hits: this.hits,
      misses: this.misses,
      stores: this.stores,
      collisions: this.collisions,
      hitRate: totalProbes > 0 ? this.hits / totalProbes : 0,
      fillRate: filled / this.size,
    };
  }

  /** Resize the table (clears all entries). */
  resize(newSize: number): void {
    this.size = newSize;
    this.entries = new Array(this.size).fill(null);
    this.generation = 0;
  }
}
