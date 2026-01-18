/**
 * Game interface - extensibility contract for all game types
 */

import type { Dart, GameConfig, GameState, GameType, Player } from "../types";

/**
 * Common interface for all dart game types.
 * Implement this interface to add new game modes (X01, Cricket, etc.)
 */
export interface Game {
  /** The game type identifier */
  readonly type: GameType;

  /** Game configuration (variant, rules, etc.) */
  readonly config: GameConfig;

  /** Current game state */
  readonly state: GameState;

  /** Players in this game */
  readonly players: Player[];

  /**
   * Record a dart throw.
   * Updates the game state accordingly.
   */
  recordThrow(dart: Dart): void;

  /**
   * Undo the last throw.
   * Returns true if undo was successful, false if nothing to undo.
   */
  undoLastThrow(): boolean;

  /**
   * Check if the game/leg is finished.
   */
  isFinished(): boolean;

  /**
   * Get the winner of the current leg, or null if not finished.
   */
  getWinner(): Player | null;

  /**
   * Get the current player whose turn it is.
   */
  getCurrentPlayer(): Player;

  /**
   * Get the score for a specific player.
   */
  getPlayerScore(playerId: string): number;
}
