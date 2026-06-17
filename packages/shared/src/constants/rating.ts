/**
 * ELO Rating & Rank Constants
 */

/** Rank tiers with their rating thresholds and display info. */
export enum Rank {
  Beginner = 'BEGINNER',
  Learner = 'LEARNER',
  Skilled = 'SKILLED',
  Advanced = 'ADVANCED',
  Expert = 'EXPERT',
  Master = 'MASTER',
  Grandmaster = 'GRANDMASTER',
}

export interface RankInfo {
  readonly rank: Rank;
  readonly name: string;
  readonly minRating: number;
  readonly maxRating: number;
  readonly color: string;
  readonly icon: string;
}

export const RANK_TIERS: ReadonlyArray<RankInfo> = [
  { rank: Rank.Beginner,     name: 'Beginner',     minRating: 0,    maxRating: 799,  color: '#8B8B8B', icon: '🪨' },
  { rank: Rank.Learner,      name: 'Learner',      minRating: 800,  maxRating: 999,  color: '#4ADE80', icon: '🌿' },
  { rank: Rank.Skilled,      name: 'Skilled',       minRating: 1000, maxRating: 1199, color: '#60A5FA', icon: '⚡' },
  { rank: Rank.Advanced,     name: 'Advanced',      minRating: 1200, maxRating: 1399, color: '#A78BFA', icon: '💎' },
  { rank: Rank.Expert,       name: 'Expert',        minRating: 1400, maxRating: 1599, color: '#F59E0B', icon: '🔥' },
  { rank: Rank.Master,       name: 'Master',        minRating: 1600, maxRating: 1799, color: '#EF4444', icon: '🏆' },
  { rank: Rank.Grandmaster,  name: 'Grandmaster',   minRating: 1800, maxRating: 9999, color: '#FF6B6B', icon: '👑' },
];

/** Get the rank info for a given rating. */
export function getRankForRating(rating: number): RankInfo {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (rating >= RANK_TIERS[i].minRating) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}
