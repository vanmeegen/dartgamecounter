/**
 * Tests for StatisticsStore
 * Tests the pure logic functions and store state management.
 * IndexedDB operations are tested through state verification after manual setup.
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { StatisticsStore } from "../StatisticsStore";
import type { CompletedLeg, VisitRecord } from "../../games/x01/types";

// Helper to create a mock StatisticsStore with db = null (simulates IndexedDB failure)
function createStoreWithoutDB(): StatisticsStore {
  const store = new StatisticsStore();
  // Wait for async init to settle (it will fail since no real IndexedDB)
  return store;
}

function makeVisitRecord(
  playerId: string,
  total: number,
  scoreAfter: number,
  busted = false
): VisitRecord {
  return {
    playerId,
    visit: {
      darts: [{ segment: total, multiplier: 1 }],
      total,
      busted,
    },
    scoreAfter,
  };
}

describe("StatisticsStore", () => {
  let store: StatisticsStore;

  beforeEach(() => {
    store = createStoreWithoutDB();
  });

  describe("initialization", () => {
    test("initializes with empty allTimeStats", () => {
      expect(store.allTimeStats.size).toBe(0);
    });

    test("handles IndexedDB unavailability gracefully", () => {
      // MobX wraps Map as ObservableMap; verify it has Map-like interface
      expect(typeof store.allTimeStats.get).toBe("function");
      expect(typeof store.allTimeStats.set).toBe("function");
      expect(typeof store.allTimeStats.has).toBe("function");
    });
  });

  describe("getPlayerStats", () => {
    test("returns null when no stats exist for player", () => {
      expect(store.getPlayerStats("x01", "Alice")).toBeNull();
    });

    test("returns data when stats exist", () => {
      const statsData = { gamesPlayed: 5, gamesWon: 3 };
      store.allTimeStats.set("x01:Alice", {
        key: "x01:Alice",
        gameType: "x01",
        playerName: "Alice",
        data: statsData,
      });

      const result = store.getPlayerStats("x01", "Alice");
      expect(result).toEqual(statsData);
    });

    test("returns null for different game type", () => {
      store.allTimeStats.set("x01:Alice", {
        key: "x01:Alice",
        gameType: "x01",
        playerName: "Alice",
        data: { gamesPlayed: 5 },
      });

      expect(store.getPlayerStats("cricket", "Alice")).toBeNull();
    });
  });

  describe("recordGameStats", () => {
    test("does nothing without db", async () => {
      const completedLegs: CompletedLeg[] = [
        {
          legNumber: 1,
          winnerId: "p1",
          visitHistory: [makeVisitRecord("p1", 60, 441)],
        },
      ];

      const playerIdToName = new Map([["p1", "Alice"]]);
      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 501, "Alice");
      // Should not throw, just return early
    });

    test("does nothing with empty completed legs", async () => {
      await store.recordGameStats("x01", ["Alice"], [], new Map(), 501, null);
      expect(store.allTimeStats.size).toBe(0);
    });

    test("does nothing for non-x01 game type (no handler)", async () => {
      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory: [] }];
      await store.recordGameStats("cricket", ["Alice"], completedLegs, new Map(), 501, null);
      expect(store.allTimeStats.size).toBe(0);
    });
  });

  describe("resetPlayerStats", () => {
    test("returns false without db", async () => {
      const result = await store.resetPlayerStats("x01", "Alice");
      expect(result).toBe(false);
    });
  });
});
