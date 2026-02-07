/**
 * GameStore - manages game selection, configuration, and current game instance.
 * Generic: uses the game registry to support any registered game type.
 */

import { makeAutoObservable } from "mobx";
import type { Player, Dart } from "../types";
import type { Game, GameDefinition } from "../games/types";
import { gameRegistry } from "../games/registry";

export class GameStore {
  /** Currently selected game type id (e.g., "x01") */
  selectedGameId: string | null = null;

  /** Game-specific configuration (shape depends on selectedGameId) */
  gameConfig: unknown = null;

  /** Current active game instance */
  currentGame: Game | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Select a game type from the registry.
   * Initializes the config to the game's default.
   */
  selectGame(gameId: string): void {
    const definition = gameRegistry.get(gameId);
    if (!definition) return;

    this.selectedGameId = gameId;
    this.gameConfig = structuredClone(definition.defaultConfig);
  }

  /**
   * Update the game-specific configuration.
   */
  updateConfig(config: unknown): void {
    this.gameConfig = config;
  }

  /**
   * Start a new game with the given players and current config.
   */
  startGame(players: Player[]): void {
    if (!this.selectedGameId || players.length === 0) return;

    const definition = gameRegistry.get(this.selectedGameId);
    if (!definition) return;

    this.currentGame = definition.createGame(players, this.gameConfig);
  }

  /**
   * Record a dart throw in the current game.
   */
  recordThrow(dart: Dart): void {
    this.currentGame?.recordThrow(dart);
  }

  /**
   * Undo the last throw.
   */
  undoLastThrow(): boolean {
    return this.currentGame?.undoLastThrow() ?? false;
  }

  /**
   * Advance to the next leg.
   */
  nextLeg(): void {
    this.currentGame?.nextLeg();
  }

  get isGameActive(): boolean {
    return this.currentGame !== null && !this.currentGame.isFinished();
  }

  get isGameFinished(): boolean {
    return this.currentGame?.isFinished() ?? false;
  }

  /**
   * Get the current game definition from the registry.
   */
  get currentGameDefinition(): GameDefinition | null {
    if (!this.selectedGameId) return null;
    return gameRegistry.get(this.selectedGameId) ?? null;
  }

  /**
   * Ensure a game is selected. If none, auto-select the first available game.
   */
  ensureGameSelected(): void {
    if (this.selectedGameId) return;
    const allGames = gameRegistry.getAll();
    if (allGames.length > 0) {
      this.selectGame(allGames[0].id);
    }
  }

  endGame(): void {
    this.currentGame = null;
  }

  reset(): void {
    this.currentGame = null;
    this.selectedGameId = null;
    this.gameConfig = null;
  }
}
