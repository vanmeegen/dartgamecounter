/**
 * Around the World-specific type definitions
 *
 * Sequence: 1-20, then Bull (25).
 * Doubles advance 2, Triples advance 3.
 */

export interface AroundTheWorldConfig {
  legs: number;
}

/**
 * The full sequence of targets: 1-20 then Bull(25).
 */
export const ATW_SEQUENCE: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25,
];

export interface AroundTheWorldPlayerState {
  playerId: string;
  /** Index into ATW_SEQUENCE (0 = target 1, 20 = target bull) */
  sequenceIndex: number;
  legsWon: number;
}

/** Snapshot for undo */
export interface ATWDartSnapshot {
  playerId: string;
  previousIndex: number;
}
