/**
 * Game registry types - defines the contract for all game modules
 */

import type { ComponentType } from "react";
import type { Dart, Player } from "../types";

/**
 * Common interface for all dart game instances.
 * Each game module implements this to provide game logic.
 */
export interface Game {
  /** The game type identifier (must match GameDefinition.id) */
  readonly type: string;

  /** Players in this game */
  readonly players: Player[];

  /** Record a dart throw */
  recordThrow(dart: Dart): void;

  /** Undo the last throw. Returns true if successful. */
  undoLastThrow(): boolean;

  /** Check if the game/match is completely finished */
  isFinished(): boolean;

  /** Check if a leg/round is finished (match may continue) */
  isLegFinished(): boolean;

  /** Get the winner, or null if not finished */
  getWinner(): Player | null;

  /** Get the current player whose turn it is */
  getCurrentPlayer(): Player;

  /** Get the score for a specific player */
  getPlayerScore(playerId: string): number;

  /** Start the next leg/round after one finishes */
  nextLeg(): void;
}

/**
 * Props passed to a game-specific config component.
 * The config component renders game-specific settings (e.g., variant, out rule for X01).
 */
export interface GameConfigComponentProps<TConfig = unknown> {
  config: TConfig;
  onConfigChange: (config: TConfig) => void;
}

/**
 * Props passed to a game-specific play component.
 * The play component renders the full gameplay UI including scores, input, etc.
 */
export interface GamePlayComponentProps {
  game: Game;
  onThrow: (segment: number, multiplier: 1 | 2 | 3) => void;
  onUndo: () => void;
  onLegFinished: () => void;
  onLeaveGame: () => void;
  onNewGame: () => void;
}

/**
 * Props for a game-specific statistics component shown in the winner dialog.
 */
export interface GameStatsComponentProps {
  game: Game;
  playerNames: string[];
}

/**
 * Defines a game module that can be registered in the game registry.
 * Each game provides its own config, play view, and statistics.
 */
export interface GameDefinition<TConfig = unknown> {
  /** Unique identifier for this game type */
  id: string;

  /** Display name shown in game selection */
  name: string;

  /** Short description of the game */
  description: string;

  /** Minimum number of players required */
  minPlayers: number;

  /** Maximum number of players allowed */
  maxPlayers: number;

  /** Default configuration for this game */
  defaultConfig: TConfig;

  /** React component for game-specific configuration */
  ConfigComponent: ComponentType<GameConfigComponentProps<TConfig>>;

  /** React component for the full gameplay view */
  PlayComponent: ComponentType<GamePlayComponentProps>;

  /** Factory function to create a new game instance */
  createGame(players: Player[], config: TConfig): Game;

  /**
   * Record game statistics after a match ends.
   * Each game defines how its stats are recorded.
   */
  recordStats?(game: Game, statisticsStore: unknown): Promise<void>;
}
