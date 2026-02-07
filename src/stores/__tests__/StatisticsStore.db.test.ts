/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Tests for StatisticsStore with mocked IndexedDB.
 * These tests cover the DB-dependent code paths.
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { StatisticsStore } from "../StatisticsStore";
import type { CompletedLeg, VisitRecord } from "../../games/x01/types";

interface MockValue {
  id?: string;
  name?: string;
  key?: string;
}

interface MockHandlers {
  getAll: (storeName: string) => Promise<unknown[]>;
  put: (storeName: string, value: MockValue) => Promise<string>;
  delete: (storeName: string, key: string) => Promise<void>;
}

function createMockDB() {
  const stores: Record<string, Map<string, unknown>> = {
    presets: new Map(),
    rememberedPlayers: new Map(),
    playerStatistics: new Map(),
  };

  const handlers: MockHandlers = {
    getAll(storeName: string) {
      return Promise.resolve(Array.from(stores[storeName]?.values() ?? []));
    },
    put(storeName: string, value: MockValue) {
      const key = value.id ?? value.name ?? value.key ?? "";
      stores[storeName]?.set(key, value);
      return Promise.resolve(key);
    },
    delete(storeName: string, key: string) {
      stores[storeName]?.delete(key);
      return Promise.resolve();
    },
  };

  const mock = {
    getAll: (...args: Parameters<MockHandlers["getAll"]>) => handlers.getAll(...args),
    put: (...args: Parameters<MockHandlers["put"]>) => handlers.put(...args),
    delete: (...args: Parameters<MockHandlers["delete"]>) => handlers.delete(...args),
  };

  return { mock, handlers, stores };
}

function createStoreWithMockDB() {
  const store = new StatisticsStore();
  const { mock, handlers, stores } = createMockDB();
  (store as unknown as { db: unknown }).db = mock;
  return { store, handlers, stores };
}

function makeVisitRecord(
  playerId: string,
  darts: { segment: number; multiplier: 1 | 2 | 3 }[],
  total: number,
  scoreAfter: number,
  busted = false
): VisitRecord {
  return {
    playerId,
    visit: { darts, total, busted },
    scoreAfter,
  };
}

describe("StatisticsStore - with mock DB", () => {
  let store: StatisticsStore;
  let handlers: MockHandlers;

  beforeEach(() => {
    const result = createStoreWithMockDB();
    store = result.store;
    handlers = result.handlers;
  });

  describe("recordGameStats - x01", () => {
    test("records stats for a single player game", async () => {
      const visitHistory: VisitRecord[] = [
        makeVisitRecord(
          "p1",
          [
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
          ],
          180,
          121
        ),
        makeVisitRecord(
          "p1",
          [
            { segment: 19, multiplier: 3 },
            { segment: 20, multiplier: 3 },
            { segment: 2, multiplier: 2 },
          ],
          121,
          0
        ),
      ];

      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];

      const playerIdToName = new Map([["p1", "Alice"]]);
      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 301, "Alice");

      const stats = store.getPlayerStats("x01", "Alice");
      expect(stats).not.toBeNull();
      expect((stats as Record<string, unknown>).gamesPlayed).toBe(1);
      expect((stats as Record<string, unknown>).gamesWon).toBe(1);
    });

    test("records stats for multiple players", async () => {
      const visitHistory: VisitRecord[] = [
        makeVisitRecord(
          "p1",
          [
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
          ],
          180,
          121
        ),
        makeVisitRecord(
          "p2",
          [
            { segment: 20, multiplier: 1 },
            { segment: 20, multiplier: 1 },
            { segment: 20, multiplier: 1 },
          ],
          60,
          241
        ),
      ];

      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];

      const playerIdToName = new Map([
        ["p1", "Alice"],
        ["p2", "Bob"],
      ]);
      await store.recordGameStats(
        "x01",
        ["Alice", "Bob"],
        completedLegs,
        playerIdToName,
        301,
        "Alice"
      );

      expect(store.getPlayerStats("x01", "Alice")).not.toBeNull();
      expect(store.getPlayerStats("x01", "Bob")).not.toBeNull();
    });

    test("accumulates stats across multiple games", async () => {
      const visitHistory: VisitRecord[] = [
        makeVisitRecord(
          "p1",
          [
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
            { segment: 20, multiplier: 3 },
          ],
          180,
          121
        ),
      ];
      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];
      const playerIdToName = new Map([["p1", "Alice"]]);

      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 301, "Alice");
      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 301, null);

      const stats = store.getPlayerStats("x01", "Alice") as Record<string, unknown>;
      expect(stats).not.toBeNull();
      expect(stats.gamesPlayed).toBe(2);
      expect(stats.gamesWon).toBe(1); // Only first game won
    });

    test("skips player when playerName not found in playerIdToName values", async () => {
      const visitHistory: VisitRecord[] = [
        makeVisitRecord("p1", [{ segment: 20, multiplier: 1 }], 20, 281),
      ];
      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];
      // Map has "p1" -> "Bob" but we ask for "Alice" who is not in the map values
      const playerIdToName = new Map([["p1", "Bob"]]);

      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 301, null);
      // "Alice" is not found in playerIdToName values, so playerId is undefined, continue skips
      expect(store.getPlayerStats("x01", "Alice")).toBeNull();
    });

    test("handles db put error gracefully", async () => {
      const visitHistory: VisitRecord[] = [
        makeVisitRecord("p1", [{ segment: 20, multiplier: 1 }], 20, 281),
      ];
      const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];
      const playerIdToName = new Map([["p1", "Alice"]]);

      handlers.put = () => Promise.reject(new Error("DB write error"));

      // Should not throw
      await store.recordGameStats("x01", ["Alice"], completedLegs, playerIdToName, 301, null);
    });
  });

  describe("resetPlayerStats", () => {
    test("removes stats for a specific player", async () => {
      // First, add some stats
      store.allTimeStats.set("x01:Alice", {
        key: "x01:Alice",
        gameType: "x01",
        playerName: "Alice",
        data: { gamesPlayed: 5 },
      });

      const result = await store.resetPlayerStats("x01", "Alice");
      expect(result).toBe(true);
      expect(store.getPlayerStats("x01", "Alice")).toBeNull();
    });

    test("handles db delete error gracefully", async () => {
      handlers.delete = () => Promise.reject(new Error("DB error"));
      const result = await store.resetPlayerStats("x01", "Alice");
      expect(result).toBe(false);
    });
  });
});
