/**
 * AI Engine Coordinator
 *
 * Wraps the minimax search engine with difficulty scaling,
 * execution monitoring, and human-like delays.
 */

import { type GameState, type Move, AILevel } from '../types/game.js';
import { MinimaxEngine, type SearchConfig } from './minimax.js';

export class AIEngine {
  private minimax: MinimaxEngine;

  constructor(ttSize: number = 1 << 18) {
    this.minimax = new MinimaxEngine(ttSize);
  }

  /**
   * Compute the best move for the AI given the current board state and level.
   *
   * @param state The current immutable game state.
   * @param level The AI difficulty level (1 to 5).
   * @param timeLimitMs Maximum time allowed for search.
   * @returns A promise resolving to the chosen Move.
   */
  async getBestMove(
    state: GameState,
    level: AILevel,
    timeLimitMs: number = 2000
  ): Promise<Move> {
    const config = this.getConfigForLevel(level, timeLimitMs);
    const startTime = performance.now();

    // Run search on the engine
    const searchResult = this.minimax.search(state, config);

    // Apply human-like delay for lower difficulties so the AI doesn't feel instantaneous
    const elapsed = performance.now() - startTime;
    const targetDelay = this.getTargetDelay(level);
    const waitTime = targetDelay - elapsed;

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    if (!searchResult.move) {
      throw new Error(`AI search returned no move. Stats: ${JSON.stringify(this.minimax.getStats())}`);
    }

    return searchResult.move;
  }

  /**
   * Reset transposition tables and search state.
   */
  clear(): void {
    this.minimax.clearTable();
  }

  /**
   * Get search stats.
   */
  getStats() {
    return this.minimax.getStats();
  }

  /**
   * Formulate search configurations tailored to the selected AI level.
   */
  private getConfigForLevel(level: AILevel, timeLimitMs: number): SearchConfig {
    switch (level) {
      case AILevel.Beginner:
        return {
          maxDepth: 1,
          timeLimitMs: Math.min(300, timeLimitMs),
          useTranspositionTable: false,
          useQuiescence: false,
          useMoveOrdering: false,
          randomness: 0.75, // Highly random
          quiescenceDepth: 0,
        };

      case AILevel.Easy:
        return {
          maxDepth: 2,
          timeLimitMs: Math.min(800, timeLimitMs),
          useTranspositionTable: true,
          useQuiescence: false,
          useMoveOrdering: true,
          randomness: 0.35, // Some random mistakes
          quiescenceDepth: 0,
        };

      case AILevel.Medium:
        return {
          maxDepth: 4,
          timeLimitMs: Math.min(1500, timeLimitMs),
          useTranspositionTable: true,
          useQuiescence: true,
          useMoveOrdering: true,
          randomness: 0.1, // Minor mistakes
          quiescenceDepth: 2,
        };

      case AILevel.Hard:
        return {
          maxDepth: 6,
          timeLimitMs: Math.min(3000, timeLimitMs),
          useTranspositionTable: true,
          useQuiescence: true,
          useMoveOrdering: true,
          randomness: 0.0, // Plays optimally within depth
          quiescenceDepth: 4,
        };

      case AILevel.Expert:
      default:
        return {
          maxDepth: 8,
          timeLimitMs: timeLimitMs,
          useTranspositionTable: true,
          useQuiescence: true,
          useMoveOrdering: true,
          randomness: 0.0, // Optimal depth-8 play
          quiescenceDepth: 6,
        };
    }
  }

  /**
   * Retrieve natural delay in milliseconds based on level.
   */
  private getTargetDelay(level: AILevel): number {
    switch (level) {
      case AILevel.Beginner:
        return 600 + Math.random() * 400;
      case AILevel.Easy:
        return 700 + Math.random() * 500;
      case AILevel.Medium:
        return 800 + Math.random() * 600;
      case AILevel.Hard:
        return 500 + Math.random() * 400;
      case AILevel.Expert:
      default:
        return 200 + Math.random() * 200;
    }
  }
}
