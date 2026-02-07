/**
 * Halve It-specific type definitions
 */

export type HalveItTarget =
  | { type: "number"; value: number; label: string }
  | { type: "double"; label: string }
  | { type: "triple"; label: string }
  | { type: "bull"; label: string };

export interface HalveItConfig {
  targets: HalveItTarget[];
  startingScore: number;
  legs: number;
}

export interface HalveItPlayerState {
  playerId: string;
  score: number;
  legsWon: number;
}

/** Default targets for a standard Halve It game */
export const DEFAULT_HALVE_IT_TARGETS: HalveItTarget[] = [
  { type: "number", value: 20, label: "20" },
  { type: "number", value: 19, label: "19" },
  { type: "number", value: 18, label: "18" },
  { type: "double", label: "Doubles" },
  { type: "number", value: 17, label: "17" },
  { type: "number", value: 16, label: "16" },
  { type: "number", value: 15, label: "15" },
  { type: "triple", label: "Triples" },
  { type: "number", value: 20, label: "D20 (any)" },
  { type: "bull", label: "Bull" },
];

/** Snapshot for undo */
export interface HalveItDartSnapshot {
  playerId: string;
  previousScore: number;
  /** Whether this was the last dart that triggered halving */
  wasHalved: boolean;
  scoreBeforeHalving: number;
}
