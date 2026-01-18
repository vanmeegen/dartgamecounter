import { describe, expect, test, beforeEach } from "bun:test";
import { PlayerSetupStore } from "../PlayerSetupStore";

describe("PlayerSetupStore", () => {
  let store: PlayerSetupStore;

  beforeEach(() => {
    store = new PlayerSetupStore();
  });

  describe("addPlayer", () => {
    test("adds a player with trimmed name", () => {
      store.addPlayer("  Alice  ");
      expect(store.players.length).toBe(1);
      expect(store.players[0].name).toBe("Alice");
    });

    test("generates unique IDs for players", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      expect(store.players[0].id).not.toBe(store.players[1].id);
    });

    test("does not add player with empty name", () => {
      store.addPlayer("   ");
      expect(store.players.length).toBe(0);
    });
  });

  describe("removePlayer", () => {
    test("removes player by ID", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      const aliceId = store.players[0].id;
      store.removePlayer(aliceId);
      expect(store.players.length).toBe(1);
      expect(store.players[0].name).toBe("Bob");
    });

    test("does nothing for non-existent ID", () => {
      store.addPlayer("Alice");
      store.removePlayer("non-existent");
      expect(store.players.length).toBe(1);
    });
  });

  describe("updatePlayerName", () => {
    test("updates player name", () => {
      store.addPlayer("Alice");
      const playerId = store.players[0].id;
      store.updatePlayerName(playerId, "  Alicia  ");
      expect(store.players[0].name).toBe("Alicia");
    });
  });

  describe("reorderPlayers", () => {
    test("moves player from one position to another", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.addPlayer("Charlie");
      store.reorderPlayers(0, 2);
      expect(store.players[0].name).toBe("Bob");
      expect(store.players[1].name).toBe("Charlie");
      expect(store.players[2].name).toBe("Alice");
    });

    test("does nothing for invalid indices", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.reorderPlayers(-1, 0);
      store.reorderPlayers(0, 5);
      expect(store.players[0].name).toBe("Alice");
      expect(store.players[1].name).toBe("Bob");
    });
  });

  describe("canProceed", () => {
    test("returns false when no players", () => {
      expect(store.canProceed).toBe(false);
    });

    test("returns true when at least one player", () => {
      store.addPlayer("Alice");
      expect(store.canProceed).toBe(true);
    });
  });

  describe("reset", () => {
    test("clears all players", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.reset();
      expect(store.players.length).toBe(0);
    });
  });
});
