/**
 * Cricket-specific type definitions
 */

export interface CricketConfig {
  marksToClose: number; // typically 3
  legs: number;
}

/** The cricket numbers: 15-20 and Bull (25) */
export const CRICKET_NUMBERS = [15, 16, 17, 18, 19, 20, 25] as const;
export type CricketNumber = (typeof CRICKET_NUMBERS)[number];

export interface CricketPlayerState {
  playerId: string;
  /** Marks on each cricket number (0 to marksToClose+) */
  marks: Map<CricketNumber, number>;
  /** Cumulative points scored */
  points: number;
  legsWon: number;
}

/** Snapshot for undo - captures marks and points before a dart */
export interface CricketDartSnapshot {
  playerId: string;
  marks: Map<CricketNumber, number>;
  points: number;
}
