/**
 * Minimax Search with Alpha-Beta Pruning
 *
 * Core search algorithm for the Baghchal AI. Features:
 *   - Negamax formulation (cleaner than separate min/max)
 *   - Alpha-beta pruning
 *   - Iterative deepening
 *   - Move ordering (captures first, then by heuristic score)
 *   - Transposition table integration
 *   - Quiescence search for capture sequences
 *   - Time-limited search
 */

import {
  type GameState,
  type Move,
  Player,
} from '../types/game.js';
import { getValidMoves, getTigerCaptures, applyMove } from '../engine/moves.js';
import { withWinCheck } from '../engine/rules.js';
import { evaluate, evaluateMove, getWinScore, getInfinityScore } from './evaluation.js';
import { TranspositionTable, TTFlag } from './transposition.js';
import { type ZobristHash, computeHash } from './zobrist.js';
import { MoveType } from '../types/game.js';

/** Search result with the best move and its evaluation. */
export interface SearchResult {
  move: Move | null;
  score: number;
  depth: number;
  nodesSearched: number;
  timeMs: number;
}

/** Search configuration per AI difficulty level. */
export interface SearchConfig {
  maxDepth: number;
  timeLimitMs: number;
  useTranspositionTable: boolean;
  useQuiescence: boolean;
  useMoveOrdering: boolean;
  randomness: number; // 0-1, how much randomness to add
  quiescenceDepth: number;
}

/** Statistics for a completed search. */
export interface SearchStats {
  nodesSearched: number;
  ttHits: number;
  betaCutoffs: number;
  quiescenceNodes: number;
}

/**
 * The Minimax search engine.
 *
 * Instantiate once and reuse across searches — the transposition
 * table persists between calls for the same game.
 */
export class MinimaxEngine {
  private tt: TranspositionTable;
  private stats: SearchStats;
  private startTime: number;
  private timeLimitMs: number;
  private searchAborted: boolean;

  constructor(ttSize: number = 1 << 18) { // 256K entries for browser
    this.tt = new TranspositionTable(ttSize);
    this.stats = this.emptyStats();
    this.startTime = 0;
    this.timeLimitMs = 0;
    this.searchAborted = false;
  }

  private emptyStats(): SearchStats {
    return { nodesSearched: 0, ttHits: 0, betaCutoffs: 0, quiescenceNodes: 0 };
  }

  /** Check if we've exceeded the time limit. */
  private isTimeUp(): boolean {
    if (this.timeLimitMs <= 0) return false;
    return (performance.now() - this.startTime) >= this.timeLimitMs;
  }

  /**
   * Run an iterative deepening search to find the best move.
   */
  search(state: GameState, config: SearchConfig): SearchResult {
    this.startTime = performance.now();
    this.timeLimitMs = config.timeLimitMs;
    this.searchAborted = false;
    this.stats = this.emptyStats();
    this.tt.newGeneration();

    const validMoves = getValidMoves(state);

    if (validMoves.length === 0) {
      return {
        move: null,
        score: 0,
        depth: 0,
        nodesSearched: 0,
        timeMs: 0,
      };
    }

    if (validMoves.length === 1) {
      return {
        move: validMoves[0],
        score: 0,
        depth: 0,
        nodesSearched: 1,
        timeMs: performance.now() - this.startTime,
      };
    }

    // Compute initial hash
    const hash = computeHash(state.board, state.currentPlayer === Player.Tiger);

    let bestMove = validMoves[0];
    let bestScore = -getInfinityScore();

    // Iterative deepening
    for (let depth = 1; depth <= config.maxDepth; depth++) {
      if (this.searchAborted) break;

      const result = this.searchRoot(state, hash, depth, config);

      if (!this.searchAborted && result.move !== null) {
        bestMove = result.move;
        bestScore = result.score;
      }

      // If we found a forced win, no need to search deeper
      if (Math.abs(bestScore) >= getWinScore() - 100) break;

      // Check time after each depth
      if (this.isTimeUp()) break;
    }

    // Add randomness for lower difficulty levels
    if (config.randomness > 0 && Math.random() < config.randomness) {
      // Pick a random move from the top N moves
      const scoredMoves = validMoves.map(m => ({
        move: m,
        score: evaluateMove(state, m),
      }));
      scoredMoves.sort((a, b) => b.score - a.score);

      const topN = Math.max(1, Math.ceil(validMoves.length * 0.4));
      const randomIndex = Math.floor(Math.random() * topN);
      bestMove = scoredMoves[randomIndex].move;
    }

    return {
      move: bestMove,
      score: bestScore,
      depth: config.maxDepth,
      nodesSearched: this.stats.nodesSearched,
      timeMs: performance.now() - this.startTime,
    };
  }

  /**
   * Root-level search with move ordering.
   */
  private searchRoot(
    state: GameState,
    hash: ZobristHash,
    maxDepth: number,
    config: SearchConfig
  ): SearchResult {
    const moves = getValidMoves(state);
    if (moves.length === 0) {
      return { move: null, score: evaluate(state), depth: maxDepth, nodesSearched: 0, timeMs: 0 };
    }

    // Order moves
    const orderedMoves = config.useMoveOrdering
      ? this.orderMoves(state, moves, hash)
      : moves;

    const isMaximizing = state.currentPlayer === Player.Tiger;
    let bestScore = -getInfinityScore();
    let bestMove = orderedMoves[0];
    let alpha = -getInfinityScore();
    const beta = getInfinityScore();

    for (const move of orderedMoves) {
      if (this.searchAborted || this.isTimeUp()) {
        this.searchAborted = true;
        break;
      }

      const newState = withWinCheck(applyMove(state, move));
      const newHash = this.updateHash(hash, state, move);

      const score = -this.negamax(
        newState,
        newHash,
        maxDepth - 1,
        -beta,
        -alpha,
        config
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      if (score > alpha) {
        alpha = score;
      }
    }

    // Flip score if goat is maximizing (our evaluation is from Tiger's POV)
    const finalScore = isMaximizing ? bestScore : -bestScore;

    return {
      move: bestMove,
      score: finalScore,
      depth: maxDepth,
      nodesSearched: this.stats.nodesSearched,
      timeMs: performance.now() - this.startTime,
    };
  }

  /**
   * Negamax search with alpha-beta pruning.
   * Always evaluates from the perspective of the current player.
   */
  private negamax(
    state: GameState,
    hash: ZobristHash,
    depth: number,
    alpha: number,
    beta: number,
    config: SearchConfig
  ): number {
    this.stats.nodesSearched++;

    // Check time periodically (every 4096 nodes)
    if ((this.stats.nodesSearched & 4095) === 0 && this.isTimeUp()) {
      this.searchAborted = true;
      return 0;
    }

    // Terminal node
    if (state.result !== null) {
      const score = evaluate(state);
      return state.currentPlayer === Player.Tiger ? score : -score;
    }

    // Leaf node — evaluate or enter quiescence
    if (depth <= 0) {
      if (config.useQuiescence) {
        return this.quiescence(state, hash, alpha, beta, config.quiescenceDepth, config);
      }
      const score = evaluate(state);
      return state.currentPlayer === Player.Tiger ? score : -score;
    }

    // Transposition table lookup
    if (config.useTranspositionTable) {
      const ttEntry = this.tt.probe(hash);
      if (ttEntry !== null && ttEntry.depth >= depth) {
        this.stats.ttHits++;
        if (ttEntry.flag === TTFlag.Exact) return ttEntry.score;
        if (ttEntry.flag === TTFlag.LowerBound && ttEntry.score >= beta) return ttEntry.score;
        if (ttEntry.flag === TTFlag.UpperBound && ttEntry.score <= alpha) return ttEntry.score;
      }
    }

    const moves = getValidMoves(state);
    if (moves.length === 0) {
      // No moves = current player loses (trapped)
      const score = evaluate(state);
      return state.currentPlayer === Player.Tiger ? score : -score;
    }

    // Order moves
    const orderedMoves = config.useMoveOrdering
      ? this.orderMoves(state, moves, hash)
      : moves;

    let bestScore = -getInfinityScore();
    let bestMove: Move | null = null;
    let flag = TTFlag.UpperBound;

    for (const move of orderedMoves) {
      if (this.searchAborted) return 0;

      const newState = withWinCheck(applyMove(state, move));
      const newHash = this.updateHash(hash, state, move);

      const score = -this.negamax(newState, newHash, depth - 1, -beta, -alpha, config);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      if (score > alpha) {
        alpha = score;
        flag = TTFlag.Exact;
      }

      if (alpha >= beta) {
        this.stats.betaCutoffs++;
        flag = TTFlag.LowerBound;
        break;
      }
    }

    // Store in transposition table
    if (config.useTranspositionTable && !this.searchAborted) {
      this.tt.store(hash, depth, bestScore, flag, bestMove);
    }

    return bestScore;
  }

  /**
   * Quiescence search — continue searching capture sequences
   * to avoid the horizon effect.
   */
  private quiescence(
    state: GameState,
    _hash: ZobristHash,
    alpha: number,
    beta: number,
    depth: number,
    _config: SearchConfig
  ): number {
    this.stats.quiescenceNodes++;
    this.stats.nodesSearched++;

    // Stand-pat score
    const standPat = state.currentPlayer === Player.Tiger
      ? evaluate(state)
      : -evaluate(state);

    if (depth <= 0) return standPat;

    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    // Only search captures
    const captures = state.currentPlayer === Player.Tiger
      ? getTigerCaptures(state)
      : []; // Goats can't capture

    for (const capture of captures) {
      if (this.searchAborted) return 0;

      const newState = withWinCheck(applyMove(state, capture));

      const score = -this.quiescence(
        newState,
        _hash, // Simplified: not updating hash in quiescence
        -beta,
        -alpha,
        depth - 1,
        _config
      );

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  /**
   * Order moves for better alpha-beta pruning.
   * Captures first, then TT best move, then positional heuristics.
   */
  private orderMoves(
    state: GameState,
    moves: Move[],
    hash: ZobristHash
  ): Move[] {
    // Check TT for a previously found best move
    const ttEntry = this.tt.probe(hash);
    const ttBestMove = ttEntry?.bestMove;

    const scored = moves.map(move => {
      let score = 0;

      // TT best move gets highest priority
      if (ttBestMove && this.movesMatch(move, ttBestMove)) {
        score += 100000;
      }

      // Captures are high priority
      if (move.type === MoveType.Capture) {
        score += 10000;
      }

      // Positional heuristic
      score += evaluateMove(state, move);

      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.move);
  }

  /** Check if two moves are the same. */
  private movesMatch(a: Move, b: Move): boolean {
    if (a.type !== b.type) return false;
    if (a.to.row !== b.to.row || a.to.col !== b.to.col) return false;
    if (a.from === null && b.from === null) return true;
    if (a.from === null || b.from === null) return false;
    return a.from.row === b.from.row && a.from.col === b.from.col;
  }

  /**
   * Incrementally update the Zobrist hash for a move.
   */
  private updateHash(_hash: ZobristHash, state: GameState, move: Move): ZobristHash {
    // Full hash recomputation for correctness.
    // Incremental updates would be faster but are error-prone with
    // the dual-32-bit scheme. At typical browser search depths
    // (≤8 ply), full recompute adds negligible overhead.
    const newState = applyMove(state, move);
    return computeHash(newState.board, newState.currentPlayer === Player.Tiger);
  }

  /** Clear the transposition table. */
  clearTable(): void {
    this.tt.clear();
  }

  /** Get search statistics. */
  getStats(): SearchStats & { ttStats: ReturnType<TranspositionTable['getStats']> } {
    return {
      ...this.stats,
      ttStats: this.tt.getStats(),
    };
  }
}
