import { describe, expect, test, beforeEach } from "bun:test";
import { RootStore } from "../RootStore";
import type { GamePreset, PlayerPreset } from "../../types";

describe("RootStore", () => {
  let rootStore: RootStore;

  beforeEach(() => {
    rootStore = new RootStore();
  });

  describe("loadPreset", () => {
    const playerPreset: PlayerPreset = {
      id: "preset-1",
      name: "Test Preset",
      type: "player",
      playerNames: ["Alice", "Bob", "Charlie"],
      createdAt: Date.now(),
    };

    test("loads player preset and navigates to game config", () => {
      rootStore.loadPreset(playerPreset);
      expect(rootStore.playerSetupStore.players).toHaveLength(3);
      expect(rootStore.uiStore.currentView).toBe("game-config");
    });

    test("randomizes player order when loading preset", () => {
      // Run multiple times to verify randomization occurs
      const orders: string[][] = [];
      for (let i = 0; i < 20; i++) {
        rootStore.loadPreset(playerPreset);
        orders.push(rootStore.playerSetupStore.players.map((p) => p.name));
      }

      // Check that at least one order is different (highly probable with 3+ players)
      const firstOrder = JSON.stringify(orders[0]);
      const hasVariation = orders.some((order) => JSON.stringify(order) !== firstOrder);
      expect(hasVariation).toBe(true);
    });

    test("game preset also randomizes player order", () => {
      const gamePreset: GamePreset = {
        id: "preset-2",
        name: "Test Game Preset",
        type: "game",
        playerNames: ["Alice", "Bob", "Charlie", "David"],
        gameConfig: { variant: 501, outRule: "double", legs: 3 },
        createdAt: Date.now(),
      };

      const orders: string[][] = [];
      for (let i = 0; i < 20; i++) {
        rootStore.loadPreset(gamePreset);
        if (rootStore.gameStore.currentGame) {
          orders.push(rootStore.gameStore.currentGame.players.map((p) => p.name));
        }
        rootStore.gameStore.endGame();
      }

      const firstOrder = JSON.stringify(orders[0]);
      const hasVariation = orders.some((order) => JSON.stringify(order) !== firstOrder);
      expect(hasVariation).toBe(true);
    });

    test("preserves all player names when randomizing", () => {
      rootStore.loadPreset(playerPreset);
      const names = rootStore.playerSetupStore.players.map((p) => p.name).sort();
      expect(names).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });
});
