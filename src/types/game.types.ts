/**
 * Shared game type definitions
 *
 * Game-specific types (X01Config, X01State, etc.) live in their
 * respective game modules (e.g., src/games/x01/types.ts).
 * This file only contains types shared across the game infrastructure.
 */

export type { Player, PlayerScore } from "./player.types";
export type { Dart, Visit } from "./dart.types";
