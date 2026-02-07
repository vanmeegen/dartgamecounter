/**
 * Around the Clock-specific type definitions
 */

export interface AroundTheClockConfig {
  includesBull: boolean;
  doublesAdvanceExtra: boolean;
  legs: number;
}

export interface AroundTheClockPlayerState {
  playerId: string;
  /** Current target number (1-20, optionally 25 for bull) */
  currentTarget: number;
  legsWon: number;
}

/** Snapshot for undo */
export interface ATCDartSnapshot {
  playerId: string;
  previousTarget: number;
}
