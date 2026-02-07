/**
 * Additional coverage tests for RootStore - uncovered methods
 */

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { RootStore } from "../RootStore";
import { gameRegistry } from "../../games/registry";
import { X01Game } from "../../games/x01/X01Game";
import type { X01Config } from "../../games/x01/types";

describe("RootStore - additional coverage", () => {
  let rootStore: RootStore;

  beforeEach(() => {
    gameRegistry.register<X01Config>({
      id: "x01",
      name: "X01",
      description: "Classic countdown (301/501)",
      minPlayers: 1,
      maxPlayers: 8,
      defaultConfig: { variant: 501, outRule: "double", legs: 1 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ConfigComponent: (() => null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PlayComponent: (() => null) as any,
      createGame: (players, config) => new X01Game(players, config as X01Config),
    });
    rootStore = new RootStore();
  });

  afterEach(() => {
    gameRegistry.unregister("x01");
  });

  describe("startNewGame", () => {
    test("does nothing with empty players", () => {
      rootStore.gameStore.selectGame("x01");
      rootStore.startNewGame();
      expect(rootStore.gameStore.currentGame).toBeNull();
      expect(rootStore.uiStore.currentView).toBe("player-setup");
    });

    test("starts game and navigates to game play", () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      rootStore.playerSetupStore.addPlayer("Bob");
      rootStore.gameStore.selectGame("x01");
      rootStore.startNewGame();
      expect(rootStore.gameStore.currentGame).not.toBeNull();
      expect(rootStore.uiStore.currentView).toBe("game-play");
    });
  });

  describe("endGameAndReset", () => {
    test("ends game and navigates to player setup", () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      rootStore.gameStore.selectGame("x01");
      rootStore.startNewGame();

      rootStore.endGameAndReset();
      expect(rootStore.gameStore.currentGame).toBeNull();
      expect(rootStore.uiStore.currentView).toBe("player-setup");
    });
  });

  describe("reset", () => {
    test("resets all stores to initial state", () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      rootStore.gameStore.selectGame("x01");
      rootStore.uiStore.goToGamePlay();

      rootStore.reset();

      expect(rootStore.playerSetupStore.players).toHaveLength(0);
      expect(rootStore.gameStore.selectedGameId).toBeNull();
      expect(rootStore.uiStore.currentView).toBe("player-setup");
    });
  });

  describe("saveCurrentAsPlayerPreset", () => {
    test("returns false when preset store has no db (no IndexedDB)", async () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      const result = await rootStore.saveCurrentAsPlayerPreset("Test");
      expect(result).toBe(false);
    });
  });

  describe("saveCurrentAsGamePreset", () => {
    test("returns false when no game type selected", async () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      const result = await rootStore.saveCurrentAsGamePreset("Test");
      expect(result).toBe(false);
    });

    test("returns false when no game config", async () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      rootStore.gameStore.selectedGameId = "x01";
      rootStore.gameStore.gameConfig = null;
      const result = await rootStore.saveCurrentAsGamePreset("Test");
      expect(result).toBe(false);
    });

    test("returns false when preset store has no db", async () => {
      rootStore.playerSetupStore.addPlayer("Alice");
      rootStore.gameStore.selectGame("x01");
      const result = await rootStore.saveCurrentAsGamePreset("Test");
      expect(result).toBe(false);
    });
  });

  describe("loadPreset - game preset", () => {
    test("loads game preset and starts game", () => {
      const gamePreset = {
        id: "p1",
        name: "Test",
        playerNames: ["Alice", "Bob"],
        gameType: "x01",
        gameConfig: { variant: 501, outRule: "double", legs: 1 },
        createdAt: Date.now(),
      };

      rootStore.loadPreset(gamePreset);
      expect(rootStore.gameStore.currentGame).not.toBeNull();
      expect(rootStore.uiStore.currentView).toBe("game-play");
    });

    test("loads game preset with unknown game type - goes to config", () => {
      const gamePreset = {
        id: "p2",
        name: "Unknown",
        playerNames: ["Alice"],
        gameType: "unknown-game",
        gameConfig: { someConfig: true },
        createdAt: Date.now(),
      };

      rootStore.loadPreset(gamePreset);
      expect(rootStore.gameStore.currentGame).toBeNull();
      expect(rootStore.uiStore.currentView).toBe("game-config");
    });
  });
});
