/**
 * Statistics type definitions
 */

/** Statistics for a single player within a game or all-time */
export interface PlayerStats {
  /** Number of legs played */
  legsPlayed: number;
  /** Number of legs won */
  legsWon: number;
  /** Total number of darts thrown */
  totalDarts: number;
  /** Total points scored (sum of all non-busted visit totals) */
  totalPointsScored: number;
  /** 3-dart average: (totalPointsScored / totalDarts) * 3 */
  average: number;
  /** Average number of darts per leg (only for won legs) */
  dartsPerLeg: number | null;
  /** Highest single-visit score */
  highestVisit: number;
  /** Best leg (fewest darts to win a leg) */
  bestLeg: number | null;
  /** Number of visits scoring 60+ */
  visits60Plus: number;
  /** Number of visits scoring 100+ */
  visits100Plus: number;
  /** Number of visits scoring 140+ */
  visits140Plus: number;
  /** Number of visits scoring 180 */
  visits180: number;
}

/** All-time statistics stored per player (persisted in IndexedDB) */
export interface AllTimePlayerStats {
  playerName: string;
  gamesPlayed: number;
  gamesWon: number;
  legsPlayed: number;
  legsWon: number;
  totalDarts: number;
  totalPointsScored: number;
  highestVisit: number;
  bestLeg: number | null;
  visits60Plus: number;
  visits100Plus: number;
  visits140Plus: number;
  visits180: number;
  /** Total darts used in legs that the player won (for avg darts per won leg) */
  totalDartsInWonLegs: number;
  /** Number of won legs (for computing dartsPerLeg) */
  wonLegCount: number;
}
