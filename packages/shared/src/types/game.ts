/**
 * Core game types for Baghchal.
 *
 * All types are designed for immutability — game state transitions
 * always produce new objects rather than mutating existing ones.
 */

/** A position on the 5×5 board (row 0-4, col 0-4). */
export interface Position {
  readonly row: number;
  readonly col: number;
}

/** Piece types on the board. */
export enum PieceType {
  Tiger = 'TIGER',
  Goat = 'GOAT',
}

/** The two players in the game. */
export enum Player {
  Tiger = 'TIGER',
  Goat = 'GOAT',
}

/** The two phases of a Baghchal game. */
export enum GamePhase {
  /** Goat placement phase — goats are placed one at a time; tigers may move and capture. */
  Placement = 'PLACEMENT',
  /** Movement phase — all 20 goats placed; both sides move existing pieces. */
  Movement = 'MOVEMENT',
}

/** Types of moves a player can make. */
export enum MoveType {
  /** Place a goat on an empty intersection (Phase 1 only). */
  Place = 'PLACE',
  /** Move a piece to an adjacent empty intersection. */
  Move = 'MOVE',
  /** Tiger captures a goat by jumping over it. */
  Capture = 'CAPTURE',
}

/** Describes a single move in the game. */
export interface Move {
  readonly player: Player;
  readonly type: MoveType;
  /** Source position (null for goat placement). */
  readonly from: Position | null;
  /** Destination position. */
  readonly to: Position;
  /** Position of the captured goat (only for capture moves). */
  readonly captured: Position | null;
}

/** The reason a game ended. */
export enum WinReason {
  /** Tiger captured 5 goats. */
  GoatsCaptured = 'GOATS_CAPTURED',
  /** All tigers are trapped (no legal moves). */
  TigersTrapped = 'TIGERS_TRAPPED',
  /** A player resigned. */
  Resignation = 'RESIGNATION',
  /** A player's time ran out. */
  Timeout = 'TIMEOUT',
  /** A player disconnected and didn't return. */
  Disconnection = 'DISCONNECTION',
  /** Both players agreed to a draw. */
  DrawAgreed = 'DRAW_AGREED',
}

/** Result of a completed game. */
export interface GameResult {
  readonly winner: Player | null; // null = draw
  readonly reason: WinReason;
}

/** The game mode being played. */
export enum GameMode {
  /** Player vs AI. */
  AI = 'AI',
  /** Local pass-and-play on same device. */
  Local = 'LOCAL',
  /** Online ranked match. */
  Ranked = 'RANKED',
  /** Online casual match. */
  Casual = 'CASUAL',
  /** Private match with a friend. */
  Friend = 'FRIEND',
}

/** AI difficulty levels. */
export enum AILevel {
  Beginner = 1,
  Easy = 2,
  Medium = 3,
  Hard = 4,
  Expert = 5,
}

/** AI difficulty display names and descriptions. */
export const AI_LEVEL_INFO: Record<AILevel, { name: string; description: string; emoji: string }> = {
  [AILevel.Beginner]: {
    name: 'Beginner',
    description: 'Makes random moves. Perfect for learning the rules.',
    emoji: '🌱',
  },
  [AILevel.Easy]: {
    name: 'Easy',
    description: 'Plays casually. Good for practicing basic strategy.',
    emoji: '🎯',
  },
  [AILevel.Medium]: {
    name: 'Medium',
    description: 'A solid challenge. Thinks a few moves ahead.',
    emoji: '⚔️',
  },
  [AILevel.Hard]: {
    name: 'Hard',
    description: 'Strong play. Will punish mistakes ruthlessly.',
    emoji: '🔥',
  },
  [AILevel.Expert]: {
    name: 'Expert',
    description: 'Near-optimal play. Only for the bravest.',
    emoji: '👑',
  },
};

/**
 * Represents the complete, immutable state of a Baghchal game
 * at any point in time.
 *
 * The board is stored as a flat array of 25 cells (row-major order).
 * Each cell is either null (empty), PieceType.Tiger, or PieceType.Goat.
 */
export interface GameState {
  /** 5×5 board stored row-major. board[row * 5 + col]. */
  readonly board: ReadonlyArray<PieceType | null>;
  /** Whose turn it is. */
  readonly currentPlayer: Player;
  /** Current game phase. */
  readonly phase: GamePhase;
  /** Number of goats placed so far (0-20). */
  readonly goatsPlaced: number;
  /** Number of goats captured by tigers (0-20). */
  readonly goatsCaptured: number;
  /** Ordered list of all moves made. */
  readonly moveHistory: ReadonlyArray<Move>;
  /** Game result if the game is over, null if in progress. */
  readonly result: GameResult | null;
  /** The move number (0-based). */
  readonly moveCount: number;
}

/** Configuration for starting a new game. */
export interface GameConfig {
  readonly mode: GameMode;
  readonly aiLevel?: AILevel;
  /** Which side the human plays in AI mode. */
  readonly playerSide?: Player;
  /** Time control in seconds (0 = no time limit). */
  readonly timeControl?: number;
}

/** Serializable game state for network transmission / storage. */
export interface SerializedGameState {
  board: (string | null)[];
  currentPlayer: string;
  phase: string;
  goatsPlaced: number;
  goatsCaptured: number;
  moveHistory: SerializedMove[];
  result: GameResult | null;
  moveCount: number;
}

/** Serializable move for network transmission / storage. */
export interface SerializedMove {
  player: string;
  type: string;
  from: Position | null;
  to: Position;
  captured: Position | null;
}
