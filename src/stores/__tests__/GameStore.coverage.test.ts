/**
 * Additional coverage tests for GameStore - uncovered methods
 */

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import type { ComponentType } from "react";
import { GameStore } from "../GameStore";
import type { Player } from "../../types";
import { gameRegistry } from "../../games/registry";
import { X01Game } from "../../games/x01/X01Game";
import type { X01Config } from "../../games/x01/types";
import type { GameConfigComponentProps, GamePlayComponentProps } from "../../games/types";

const StubConfig = (() => null) as ComponentType<GameConfigComponentProps<X01Config>>;
const StubPlay = (() => null) as ComponentType<GamePlayComponentProps>;

describe("GameStore - additional coverage", () => {
  let store: GameStore;
  const players: Player[] = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ];

  beforeEach(() => {
    gameRegistry.register<X01Config>({
      id: "x01",
      name: "X01",
      description: "Classic countdown (301/501)",
      minPlayers: 1,
      maxPlayers: 8,
      defaultConfig: { variant: 501, outRule: "double", legs: 1 },
      ConfigComponent: StubConfig,
      PlayComponent: StubPlay,
      createGame: (p, config) => new X01Game(p, config),
    });
    store = new GameStore();
  });

  afterEach(() => {
    gameRegistry.unregister("x01");
  });

  describe("recordThrow", () => {
    test("records a throw on current game", () => {
      store.selectGame("x01");
      store.startGame(players);
      store.recordThrow({ segment: 20, multiplier: 3 });
      expect(store.currentGame?.getPlayerScore("p1")).toBe(441);
    });

    test("does nothing when no current game", () => {
      // Should not throw
      store.recordThrow({ segment: 20, multiplier: 3 });
    });
  });

  describe("undoLastThrow", () => {
    test("undoes last throw on current game", () => {
      store.selectGame("x01");
      store.startGame(players);
      store.recordThrow({ segment: 20, multiplier: 3 });
      const result = store.undoLastThrow();
      expect(result).toBe(true);
      expect(store.currentGame?.getPlayerScore("p1")).toBe(501);
    });

    test("returns false when no current game", () => {
      expect(store.undoLastThrow()).toBe(false);
    });
  });

  describe("nextLeg", () => {
    test("advances to next leg on current game", () => {
      store.selectGame("x01");
      store.updateConfig({ variant: 301, outRule: "single", legs: 3 });
      store.startGame(players);

      // Win a leg
      const game = store.currentGame as X01Game;
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });

      store.nextLeg();
      expect(game.state.currentLeg).toBe(2);
    });

    test("does nothing when no current game", () => {
      // Should not throw
      store.nextLeg();
    });
  });

  describe("isGameActive", () => {
    test("returns false when game is finished", () => {
      store.selectGame("x01");
      store.startGame(players);
      const game = store.currentGame as X01Game;
      game.state.players[0].score = 32;
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 checkout
      expect(store.isGameActive).toBe(false);
    });
  });

  describe("isGameFinished", () => {
    test("returns false when no game", () => {
      expect(store.isGameFinished).toBe(false);
    });

    test("returns true when game is finished", () => {
      store.selectGame("x01");
      store.startGame(players);
      const game = store.currentGame as X01Game;
      game.state.players[0].score = 32;
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 checkout
      expect(store.isGameFinished).toBe(true);
    });
  });

  describe("ensureGameSelected", () => {
    test("auto-selects first game when none selected", () => {
      expect(store.selectedGameId).toBeNull();
      store.ensureGameSelected();
      expect(store.selectedGameId).toBe("x01");
    });

    test("does nothing when game already selected", () => {
      store.selectGame("x01");
      store.ensureGameSelected();
      expect(store.selectedGameId).toBe("x01");
    });
  });

  describe("startGame edge cases", () => {
    test("does not start when registry returns undefined for gameId", () => {
      store.selectedGameId = "nonexistent";
      store.startGame(players);
      expect(store.currentGame).toBeNull();
    });
  });
});
