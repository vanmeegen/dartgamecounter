/**
 * Game configuration and state type definitions
 */

import type { Player, PlayerScore } from "./player.types";
import type { Dart, Visit } from "./dart.types";

export type GameType = "x01";
export type X01Variant = 301 | 501;
export type OutRule = "single" | "double";

export interface X01Config {
  variant: X01Variant;
  outRule: OutRule;
  legs: number;
}

export interface X01State {
  players: PlayerScore[];
  currentPlayerIndex: number;
  currentVisit: Visit;
  currentLeg: number;
  /** Index of the player who started the current leg (for rotation) */
  legStartingPlayerIndex: number;
  /** History of all visits for undo functionality */
  visitHistory: { playerId: string; visit: Visit; scoreAfter: number }[];
  /** Match is finished (someone won enough legs) */
  finished: boolean;
  /** Current leg is finished (waiting for nextLeg call) */
  legFinished: boolean;
  winnerId: string | null;
}

export interface CheckoutSuggestion {
  darts: Dart[];
  description: string;
}

/** Base game configuration */
export type GameConfig = X01Config;

/** Base game state */
export type GameState = X01State;

export type { Player, PlayerScore, Dart, Visit };
