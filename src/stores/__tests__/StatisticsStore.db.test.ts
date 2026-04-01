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

interface MockDB {
  mock: {
    getAll: (...args: Parameters<MockHandlers["getAll"]>) => Promise<unknown[]>;
    put: (...args: Parameters<MockHandlers["put"]>) => Promise<string>;
    delete: (...args: Parameters<MockHandlers["delete"]>) => Promise<void>;
  };
  handlers: MockHandlers;
  stores: Record<string, Map<string, unknown>>;
}

function createMockDB(): MockDB {
  const stores: Record<string, Map<string, unknown>> = {
    presets: new Map(),
    rememberedPlayers: new Map(),
    playerStatistics: new Map(),
  };

  const handlers: MockHandlers = {
    getAll(storeName: string): Promise<unknown[]> {
      return Promise.resolve(Array.from(stores[storeName]?.values() ?? []));
    },
    put(storeName: string, value: MockValue): Promise<string> {
      const key = value.id ?? value.name ?? value.key ?? "";
      stores[storeName]?.set(key, value);
      return Promise.resolve(key);
    },
    delete(storeName: string, key: string): Promise<void> {
      stores[storeName]?.delete(key);
      return Promise.resolve();
    },
  };

  const mock = {
    getAll: (...args: Parameters<MockHandlers["getAll"]>): Promise<unknown[]> =>
      handlers.getAll(...args),
    put: (...args: Parameters<MockHandlers["put"]>): Promise<string> => handlers.put(...args),
    delete: (...args: Parameters<MockHandlers["delete"]>): Promise<void> =>
      handlers.delete(...args),
  };

  return { mock, handlers, stores };
}

function createStoreWithMockDB(): {
  store: StatisticsStore;
  handlers: MockHandlers;
  stores: Record<string, Map<string, unknown>>;
} {
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

      handlers.put = (): Promise<string> => Promise.reject(new Error("DB write error"));

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
      handlers.delete = (): Promise<void> => Promise.reject(new Error("DB error"));
      const result = await store.resetPlayerStats("x01", "Alice");
      expect(result).toBe(false);
    });
  });

  describe("recordGameStats - multi-leg game accumulation", () => {
    function make3DartVisit(
      playerId: string,
      s1: number,
      m1: 1 | 2 | 3,
      s2: number,
      m2: 1 | 2 | 3,
      s3: number,
      m3: 1 | 2 | 3,
      total: number,
      scoreAfter: number,
      busted = false
    ): VisitRecord {
      return makeVisitRecord(
        playerId,
        [
          { segment: s1, multiplier: m1 },
          { segment: s2, multiplier: m2 },
          { segment: s3, multiplier: m3 },
        ],
        total,
        scoreAfter,
        busted
      );
    }

    test("records correct all-time stats after a 3-leg game", async () => {
      // Leg 1: Alice (p1) wins in 9 darts (3 visits), p1: 180 + 180 + 141 = 501
      const leg1Fixed: CompletedLeg = {
        legNumber: 1,
        winnerId: "p1",
        visitHistory: [
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 321),
          make3DartVisit("p2", 20, 1, 20, 1, 20, 1, 60, 441),
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 141),
          make3DartVisit("p2", 20, 1, 20, 1, 20, 1, 60, 381),
          make3DartVisit("p1", 19, 3, 20, 3, 12, 2, 141, 0),
        ],
      };

      // Leg 2: Bob (p2) wins in 15 darts (5 visits)
      const leg2: CompletedLeg = {
        legNumber: 2,
        winnerId: "p2",
        visitHistory: [
          make3DartVisit("p2", 20, 3, 20, 1, 20, 1, 100, 401),
          make3DartVisit("p1", 20, 1, 20, 1, 20, 1, 60, 441),
          make3DartVisit("p2", 20, 3, 20, 1, 20, 1, 100, 301),
          make3DartVisit("p1", 20, 1, 20, 1, 20, 1, 60, 381),
          make3DartVisit("p2", 20, 3, 20, 1, 20, 1, 100, 201),
          make3DartVisit("p1", 20, 1, 20, 1, 20, 1, 60, 321),
          make3DartVisit("p2", 20, 3, 20, 1, 20, 1, 100, 101),
          make3DartVisit("p1", 20, 1, 20, 1, 20, 1, 60, 261),
          make3DartVisit("p2", 19, 3, 20, 1, 12, 2, 101, 0),
        ],
      };

      // Leg 3: Alice (p1) wins in 12 darts (4 visits): 180 + 180 + 100 + 41 = 501
      const leg3_12darts: CompletedLeg = {
        legNumber: 3,
        winnerId: "p1",
        visitHistory: [
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 321),
          make3DartVisit("p2", 20, 1, 20, 1, 20, 1, 60, 441),
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 141),
          make3DartVisit("p2", 20, 1, 20, 1, 20, 1, 60, 381),
          make3DartVisit("p1", 20, 3, 20, 1, 20, 1, 100, 41),
          make3DartVisit("p2", 20, 1, 20, 1, 20, 1, 60, 321),
          make3DartVisit("p1", 19, 1, 20, 1, 1, 2, 41, 0),
        ],
      };

      const completedLegs = [leg1Fixed, leg2, leg3_12darts];
      const playerIdToName = new Map([
        ["p1", "Alice"],
        ["p2", "Bob"],
      ]);

      await store.recordGameStats(
        "x01",
        ["Alice", "Bob"],
        completedLegs,
        playerIdToName,
        501,
        "Alice"
      );

      const aliceStats = store.getPlayerStats("x01", "Alice") as Record<string, unknown>;
      expect(aliceStats).not.toBeNull();
      expect(aliceStats.gamesPlayed).toBe(1);
      expect(aliceStats.gamesWon).toBe(1);
      expect(aliceStats.legsPlayed).toBe(3);
      expect(aliceStats.legsWon).toBe(2);

      // Alice: leg1 = 9 darts, leg2 = 12 darts (4 visits as loser), leg3 = 12 darts
      // totalDarts = 9 + 12 + 12 = 33
      expect(aliceStats.totalDarts).toBe(33);

      // Alice won legs 1 and 3: totalDartsInWonLegs = 9 + 12 = 21
      expect(aliceStats.totalDartsInWonLegs).toBe(21);
      expect(aliceStats.wonLegCount).toBe(2);

      // All-time average = (totalPointsScored / totalDarts) * 3
      // Alice totalPointsScored: leg1=501(winner) + leg2=240(loser: 4*60) + leg3=501(winner) = 1242
      expect(aliceStats.totalPointsScored).toBe(1242);
      const aliceAverage =
        ((aliceStats.totalPointsScored as number) / (aliceStats.totalDarts as number)) * 3;
      expect(aliceAverage).toBeCloseTo((1242 / 33) * 3);
      // Sanity: average should be reasonable (not > 180)
      expect(aliceAverage).toBeLessThanOrEqual(180);
      expect(aliceAverage).toBeGreaterThan(0);
    });

    test("totalDartsInWonLegs accumulates correctly across multiple games", async () => {
      const leg1: CompletedLeg = {
        legNumber: 1,
        winnerId: "p1",
        visitHistory: [
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 321),
          make3DartVisit("p1", 20, 3, 20, 3, 20, 3, 180, 141),
          make3DartVisit("p1", 19, 3, 20, 3, 12, 2, 141, 0),
        ],
      };
      // Game 1: Alice wins in 9 darts
      const playerIdToName = new Map([["p1", "Alice"]]);
      await store.recordGameStats("x01", ["Alice"], [leg1], playerIdToName, 501, "Alice");

      let stats = store.getPlayerStats("x01", "Alice") as Record<string, unknown>;
      expect(stats.totalDartsInWonLegs).toBe(9);
      expect(stats.wonLegCount).toBe(1);

      // Game 2: Alice wins in 15 darts
      const leg2: CompletedLeg = {
        legNumber: 1,
        winnerId: "p1",
        visitHistory: [
          make3DartVisit("p1", 20, 3, 20, 1, 20, 1, 100, 401),
          make3DartVisit("p1", 20, 3, 20, 1, 20, 1, 100, 301),
          make3DartVisit("p1", 20, 3, 20, 1, 20, 1, 100, 201),
          make3DartVisit("p1", 20, 3, 20, 1, 20, 1, 100, 101),
          make3DartVisit("p1", 19, 3, 20, 1, 12, 2, 101, 0),
        ],
      };
      await store.recordGameStats("x01", ["Alice"], [leg2], playerIdToName, 501, "Alice");

      stats = store.getPlayerStats("x01", "Alice") as Record<string, unknown>;
      // Should be 9 + 15 = 24, not lossy from floating point
      expect(stats.totalDartsInWonLegs).toBe(24);
      expect(stats.wonLegCount).toBe(2);

      // Darts per leg should be 24 / 2 = 12
      const dartsPerLeg = (stats.totalDartsInWonLegs as number) / (stats.wonLegCount as number);
      expect(dartsPerLeg).toBe(12);
    });
  });
});
