/**
 * X01 Game Module - registration and exports
 *
 * This module registers the X01 game (301/501) with the game registry.
 * Import this module to make X01 available in the game selection.
 */

import { gameRegistry } from "../registry";
import { X01Game } from "./X01Game";
import { X01ConfigView } from "./X01ConfigView";
import { X01PlayView } from "./X01PlayView";
import type { X01Config } from "./types";
import type { Game } from "../types";

/** Register X01 game in the global registry */
gameRegistry.register<X01Config>({
  id: "x01",
  name: "X01",
  description: "Classic countdown (301/501)",
  minPlayers: 1,
  maxPlayers: 8,
  defaultConfig: { variant: 501, outRule: "double", legs: 1 },
  ConfigComponent: X01ConfigView,
  PlayComponent: X01PlayView,
  createGame: (players, config) => new X01Game(players, config),
  recordStats: async (game: Game, statisticsStore: unknown) => {
    const x01Game = game as X01Game;
    const completedLegs = x01Game.getAllCompletedLegs();
    if (completedLegs.length === 0) return;

    const playerIdToName = new Map(x01Game.players.map((p) => [p.id, p.name]));
    const playerNames = x01Game.players.map((p) => p.name);
    const matchWinner = x01Game.getWinner();

    const store = statisticsStore as {
      recordGameStats(
        gameType: string,
        playerNames: string[],
        completedLegs: unknown[],
        playerIdToName: Map<string, string>,
        gameVariant: number,
        matchWinnerName: string | null
      ): Promise<void>;
    };

    await store.recordGameStats(
      "x01",
      playerNames,
      completedLegs,
      playerIdToName,
      x01Game.config.variant,
      matchWinner?.name ?? null
    );
  },
});

// Re-export for direct usage
export { X01Game } from "./X01Game";
export { X01ConfigView } from "./X01ConfigView";
export { X01PlayView } from "./X01PlayView";
export { X01ScoreDisplay } from "./X01ScoreDisplay";
export { X01CheckoutDisplay } from "./X01CheckoutDisplay";
export { X01Statistics } from "./X01Statistics";
export { calculateX01PlayerStats, createEmptyX01Stats } from "./statistics";
export { getCheckoutSuggestion, calculateCheckout, COMMON_CHECKOUTS } from "./checkout";
export type {
  X01Config,
  X01Variant,
  OutRule,
  X01State,
  X01PlayerScore,
  VisitRecord,
  CompletedLeg,
  CheckoutSuggestion,
  X01PlayerStats,
  X01AllTimePlayerStats,
} from "./types";
