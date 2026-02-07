/**
 * X01-specific type definitions
 */

import type { Dart, Visit } from "../../types";

export type X01Variant = 301 | 501;
export type OutRule = "single" | "double";

export interface X01Config {
  variant: X01Variant;
  outRule: OutRule;
  legs: number;
}

export interface VisitRecord {
  playerId: string;
  visit: Visit;
  scoreAfter: number;
}

export interface CompletedLeg {
  legNumber: number;
  winnerId: string | null;
  visitHistory: VisitRecord[];
}

export interface X01State {
  players: X01PlayerScore[];
  currentPlayerIndex: number;
  currentVisit: Visit;
  currentLeg: number;
  /** Index of the player who started the current leg (for rotation) */
  legStartingPlayerIndex: number;
  /** History of all visits for undo functionality */
  visitHistory: VisitRecord[];
  /** History of all completed legs (preserved across nextLeg calls) */
  completedLegs: CompletedLeg[];
  /** Match is finished (someone won enough legs) */
  finished: boolean;
  /** Current leg is finished (waiting for nextLeg call) */
  legFinished: boolean;
  winnerId: string | null;
}

export interface X01PlayerScore {
  playerId: string;
  score: number;
  legsWon: number;
}

export interface CheckoutSuggestion {
  darts: Dart[];
  description: string;
}

/** X01-specific per-game player stats */
export interface X01PlayerStats {
  legsPlayed: number;
  legsWon: number;
  totalDarts: number;
  totalPointsScored: number;
  average: number;
  dartsPerLeg: number | null;
  highestVisit: number;
  bestLeg: number | null;
  visits60Plus: number;
  visits100Plus: number;
  visits140Plus: number;
  visits180: number;
}

/** X01-specific all-time player stats (persisted in IndexedDB) */
export interface X01AllTimePlayerStats {
  playerName: string;
  gameType: "x01";
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
  totalDartsInWonLegs: number;
  wonLegCount: number;
}
