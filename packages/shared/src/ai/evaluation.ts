/**
 * Board Evaluation Heuristics
 *
 * Evaluates a Baghchal position from the Tiger's perspective.
 * Positive scores favor Tiger; negative scores favor Goat.
 *
 * The evaluation considers:
 *   1. Material (captured goats)
 *   2. Tiger mobility (legal moves)
 *   3. Capture threats (immediate capture opportunities)
 *   4. Positional control (center, strategic positions)
 *   5. Goat formation (how well goats constrain tigers)
 *   6. Phase-aware weighting
 */

import { type GameState, PieceType, Player, GamePhase } from '../types/game.js';
import {
  TOTAL_POSITIONS,
  adjacencyList,
  jumpPaths,
  POSITION_WEIGHTS,
  CENTER_INDEX,
} from '../constants/board.js';
import { TOTAL_GOATS } from '../constants/game.js';

/** Score constants. */
const INFINITY_SCORE = 100000;
const WIN_SCORE = 50000;

/** Return the maximum possible score (win). */
export function getWinScore(): number {
  return WIN_SCORE;
}

/** Return infinity for alpha-beta bounds. */
export function getInfinityScore(): number {
  return INFINITY_SCORE;
}

/**
 * Evaluate the board position from Tiger's perspective.
 *
 * @returns A score where positive = Tiger advantage, negative = Goat advantage.
 */
export function evaluate(state: GameState): number {
  // Terminal states
  if (state.result !== null) {
    if (state.result.winner === Player.Tiger) return WIN_SCORE - state.moveCount;
    if (state.result.winner === Player.Goat) return -WIN_SCORE + state.moveCount;
    return 0; // Draw
  }

  let score = 0;

  // ── 1. Material ──────────────────────────────────────────────────────
  // Each captured goat is extremely valuable
  score += state.goatsCaptured * 500;

  // Bonus for being close to winning
  if (state.goatsCaptured >= 4) score += 300;
  if (state.goatsCaptured >= 3) score += 150;

  // ── 2. Tiger Mobility ────────────────────────────────────────────────
  let tigerMobility = 0;
  let tigerCaptureThreats = 0;
  const tigerPositions: number[] = [];

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Tiger) continue;
    tigerPositions.push(i);

    // Count simple moves
    const neighbors = adjacencyList[i];
    for (const n of neighbors) {
      if (state.board[n] === null) tigerMobility++;
    }

    // Count capture threats
    const jumps = jumpPaths[i];
    for (const jump of jumps) {
      if (state.board[jump.over] === PieceType.Goat && state.board[jump.land] === null) {
        tigerCaptureThreats++;
      }
    }
  }

  // Mobility is critical — a trapped tiger is worthless
  score += tigerMobility * 25;

  // Capture threats create pressure
  score += tigerCaptureThreats * 200;

  // Penalty for low mobility (approaching trapped state)
  if (tigerMobility <= 2) score -= 300;
  if (tigerMobility === 0) score -= 2000; // Nearly trapped

  // ── 3. Positional Control ────────────────────────────────────────────
  // Tigers on strategic positions (center, high-connectivity nodes)
  for (const tPos of tigerPositions) {
    score += POSITION_WEIGHTS[tPos] * 15;
  }

  // Center control bonus for tigers
  if (state.board[CENTER_INDEX] === PieceType.Tiger) {
    score += 60;
  }

  // ── 4. Goat Formation Analysis ───────────────────────────────────────
  let goatClusters = 0;
  let goatVulnerability = 0;

  for (let i = 0; i < TOTAL_POSITIONS; i++) {
    if (state.board[i] !== PieceType.Goat) continue;

    // Goats adjacent to other goats form defensive clusters (bad for tiger)
    const neighbors = adjacencyList[i];
    let adjacentGoats = 0;
    let adjacentTigers = 0;

    for (const n of neighbors) {
      if (state.board[n] === PieceType.Goat) adjacentGoats++;
      if (state.board[n] === PieceType.Tiger) adjacentTigers++;
    }

    if (adjacentGoats >= 2) goatClusters++;

    // Goats next to tigers with empty jump landing = vulnerable
    if (adjacentTigers > 0) {
      goatVulnerability++;
    }

    // Goat positional value (from goat's perspective)
    score -= POSITION_WEIGHTS[i] * 5;
  }

  // Goat clusters make them harder to capture (bad for tiger)
  score -= goatClusters * 20;

  // Vulnerable goats are good for tiger
  score += goatVulnerability * 30;

  // ── 5. Phase-Specific Adjustments ────────────────────────────────────
  if (state.phase === GamePhase.Placement) {
    // During placement, goats remaining to place = future blocking power
    const goatsRemaining = TOTAL_GOATS - state.goatsPlaced;
    score -= goatsRemaining * 10; // More goats to place = more future defense

    // Early captures are very valuable in placement phase
    score += state.goatsCaptured * 100;
  } else {
    // In movement phase, tiger spread is important
    if (tigerPositions.length >= 2) {
      let totalDist = 0;
      let pairs = 0;
      for (let i = 0; i < tigerPositions.length; i++) {
        for (let j = i + 1; j < tigerPositions.length; j++) {
          const r1 = Math.floor(tigerPositions[i] / 5);
          const c1 = tigerPositions[i] % 5;
          const r2 = Math.floor(tigerPositions[j] / 5);
          const c2 = tigerPositions[j] % 5;
          totalDist += Math.abs(r1 - r2) + Math.abs(c1 - c2);
          pairs++;
        }
      }
      // Tigers should spread out, not cluster
      const avgDist = totalDist / pairs;
      if (avgDist >= 3) score += 30;
      else if (avgDist <= 1) score -= 40;
    }
  }

  // ── 6. Tempo ─────────────────────────────────────────────────────────
  // Small bonus for having the initiative
  if (state.currentPlayer === Player.Tiger) {
    score += 10;
  } else {
    score -= 10;
  }

  return score;
}

/**
 * Quick evaluation for move ordering.
 * Provides a rough score for a move without full board evaluation.
 */
export function evaluateMove(state: GameState, move: import('../types/game.js').Move): number {
  let score = 0;

  // Captures are the most important moves
  if (move.captured !== null) {
    score += 10000;
    // Capturing toward a win is even better
    if (state.goatsCaptured >= 3) score += 5000;
  }

  // Center control
  if (move.to.row === 2 && move.to.col === 2) score += 100;

  // Positional improvement
  const toIdx = move.to.row * 5 + move.to.col;
  score += POSITION_WEIGHTS[toIdx] * 10;

  if (move.from) {
    const fromIdx = move.from.row * 5 + move.from.col;
    score += (POSITION_WEIGHTS[toIdx] - POSITION_WEIGHTS[fromIdx]) * 5;
  }

  return score;
}
