/**
 * Additional coverage tests for PlayerSetupStore - uncovered getters
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { PlayerSetupStore } from "../PlayerSetupStore";

describe("PlayerSetupStore - additional coverage", () => {
  let store: PlayerSetupStore;

  beforeEach(() => {
    store = new PlayerSetupStore();
  });

  describe("playerCount", () => {
    test("returns 0 when no players", () => {
      expect(store.playerCount).toBe(0);
    });

    test("returns correct count after adding players", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      expect(store.playerCount).toBe(2);
    });

    test("returns updated count after removing a player", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.removePlayer(store.players[0].id);
      expect(store.playerCount).toBe(1);
    });
  });

  describe("updatePlayerName - non-existent player", () => {
    test("does nothing for non-existent player id", () => {
      store.addPlayer("Alice");
      store.updatePlayerName("non-existent", "New Name");
      expect(store.players[0].name).toBe("Alice");
    });
  });

  describe("reset", () => {
    test("resets nextId counter (new players start from player-1 again)", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      const lastId = store.players[1].id; // "player-2"
      store.reset();
      store.addPlayer("Charlie");
      expect(store.players[0].id).toBe("player-1"); // Reset counter
      expect(store.players[0].id).not.toBe(lastId);
    });
  });
});
