/**
 * Shanghai-specific type definitions
 */

export interface ShanghaiConfig {
  /** Number of rounds to play */
  rounds: number;
  /** Starting number (target for round 1) */
  startNumber: number;
  legs: number;
}

export interface ShanghaiPlayerState {
  playerId: string;
  /** Cumulative score across all rounds */
  totalScore: number;
  legsWon: number;
}

/** Snapshot for undo */
export interface ShanghaiDartSnapshot {
  playerId: string;
  previousScore: number;
  wasFinished: boolean;
  wasLegFinished: boolean;
}
