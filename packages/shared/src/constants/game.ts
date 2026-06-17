/**
 * Game-wide constants for Baghchal.
 */

/** Total number of goats in the game. */
export const TOTAL_GOATS = 20;

/** Total number of tigers in the game. */
export const TOTAL_TIGERS = 4;

/** Number of goats that must be captured for the tiger to win. */
export const GOATS_TO_CAPTURE = 5;

/** Maximum number of moves before a draw is declared (prevents infinite games). */
export const MAX_MOVES = 200;

/** Default time control in seconds (0 = no time limit). */
export const DEFAULT_TIME_CONTROL = 0;

/** Default starting ELO rating for new players. */
export const DEFAULT_RATING = 1200;

/** ELO K-factor for established players (20+ games). */
export const ELO_K_FACTOR = 32;

/** ELO K-factor for provisional players (<20 games). */
export const ELO_K_FACTOR_PROVISIONAL = 64;

/** Number of games before a player is considered "established". */
export const PROVISIONAL_GAMES_THRESHOLD = 20;
