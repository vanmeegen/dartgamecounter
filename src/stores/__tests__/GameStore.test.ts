import { describe, expect, test, beforeEach } from "bun:test";
import { GameStore } from "../GameStore";
import type { Player } from "../../types";

describe("GameStore", () => {
  let store: GameStore;
  const players: Player[] = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ];

  beforeEach(() => {
    store = new GameStore();
  });

  describe("configuration", () => {
    test("has default config", () => {
      expect(store.variant).toBe(501);
      expect(store.outRule).toBe("double");
      expect(store.legs).toBe(1);
    });

    test("setVariant updates variant", () => {
      store.setVariant(301);
      expect(store.variant).toBe(301);
    });

    test("setOutRule updates out rule", () => {
      store.setOutRule("single");
      expect(store.outRule).toBe("single");
    });

    test("setLegs updates legs (minimum 1)", () => {
      store.setLegs(3);
      expect(store.legs).toBe(3);
      store.setLegs(0);
      expect(store.legs).toBe(1);
    });
  });

  describe("startGame", () => {
    test("creates a new game instance", () => {
      expect(store.currentGame).toBeNull();
      store.startGame(players);
      expect(store.currentGame).not.toBeNull();
    });

    test("does not start with empty players", () => {
      store.startGame([]);
      expect(store.currentGame).toBeNull();
    });

    test("initializes game with correct config", () => {
      store.setVariant(301);
      store.setOutRule("single");
      store.startGame(players);
      expect(store.currentGame?.config.variant).toBe(301);
      expect(store.currentGame?.config.outRule).toBe("single");
    });
  });

  describe("game state", () => {
    test("isGameActive returns true when game is running", () => {
      store.startGame(players);
      expect(store.isGameActive).toBe(true);
    });

    test("isGameActive returns false when no game", () => {
      expect(store.isGameActive).toBe(false);
    });

    test("endGame clears current game", () => {
      store.startGame(players);
      store.endGame();
      expect(store.currentGame).toBeNull();
    });
  });

  describe("reset", () => {
    test("resets to default state", () => {
      store.setVariant(301);
      store.startGame(players);
      store.reset();
      expect(store.variant).toBe(501);
      expect(store.currentGame).toBeNull();
    });
  });
});
