/**
 * Game Registry - central registration point for all game modules
 *
 * Games register themselves by calling gameRegistry.register().
 * The registry provides lookup and listing of all available games.
 */

import type { GameDefinition } from "./types";

class GameRegistry {
  private games = new Map<string, GameDefinition>();

  /**
   * Register a game definition. Call this from each game module's index.ts.
   */
  register<TConfig>(definition: GameDefinition<TConfig>): void {
    if (this.games.has(definition.id)) {
      console.warn(`Game "${definition.id}" is already registered. Overwriting.`);
    }
    this.games.set(definition.id, definition as GameDefinition);
  }

  /**
   * Get a game definition by id.
   */
  get(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  /**
   * Get all registered game definitions (for the selection UI).
   */
  getAll(): GameDefinition[] {
    return Array.from(this.games.values());
  }

  /**
   * Remove a game definition by id.
   */
  unregister(id: string): void {
    this.games.delete(id);
  }

  /**
   * Check if a game type is registered.
   */
  has(id: string): boolean {
    return this.games.has(id);
  }
}

/** Singleton game registry instance */
export const gameRegistry = new GameRegistry();
