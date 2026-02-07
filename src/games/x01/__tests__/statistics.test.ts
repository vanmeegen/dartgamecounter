import { describe, expect, test } from "bun:test";
import { calculateX01PlayerStats, createEmptyX01Stats } from "../statistics";
import type { CompletedLeg, VisitRecord } from "../types";

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

describe("calculateX01PlayerStats", () => {
  test("returns zero stats for empty completed legs", () => {
    const stats = calculateX01PlayerStats("p1", [], 501);
    expect(stats.legsPlayed).toBe(0);
    expect(stats.legsWon).toBe(0);
    expect(stats.totalDarts).toBe(0);
    expect(stats.totalPointsScored).toBe(0);
    expect(stats.average).toBe(0);
    expect(stats.dartsPerLeg).toBeNull();
    expect(stats.highestVisit).toBe(0);
    expect(stats.bestLeg).toBeNull();
    expect(stats.visits60Plus).toBe(0);
    expect(stats.visits100Plus).toBe(0);
    expect(stats.visits140Plus).toBe(0);
    expect(stats.visits180).toBe(0);
  });

  test("calculates stats for a single won leg", () => {
    const visitHistory: VisitRecord[] = [
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        321
      ),
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        441
      ),
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        141
      ),
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        381
      ),
      makeVisitRecord(
        "p1",
        [
          { segment: 19, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 12, multiplier: 2 },
        ],
        141,
        0
      ),
    ];

    const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];

    const stats = calculateX01PlayerStats("p1", completedLegs, 501);
    expect(stats.legsPlayed).toBe(1);
    expect(stats.legsWon).toBe(1);
    expect(stats.totalDarts).toBe(9);
    // Winner gets gameVariant as points
    expect(stats.totalPointsScored).toBe(501);
    expect(stats.average).toBeCloseTo((501 / 9) * 3);
    expect(stats.dartsPerLeg).toBe(9);
    expect(stats.highestVisit).toBe(180);
    expect(stats.bestLeg).toBe(9);
    expect(stats.visits180).toBe(2);
    expect(stats.visits140Plus).toBe(3); // 180 x2 + 141
    expect(stats.visits100Plus).toBe(3);
    expect(stats.visits60Plus).toBe(3);
  });

  test("calculates stats for a player who lost the leg", () => {
    const visitHistory: VisitRecord[] = [
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        321
      ),
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        441
      ),
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        141
      ),
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        381
      ),
      makeVisitRecord(
        "p1",
        [
          { segment: 19, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 12, multiplier: 2 },
        ],
        141,
        0
      ),
    ];

    const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p1", visitHistory }];

    const stats = calculateX01PlayerStats("p2", completedLegs, 501);
    expect(stats.legsPlayed).toBe(1);
    expect(stats.legsWon).toBe(0);
    expect(stats.totalDarts).toBe(6);
    // Non-winner gets sum of non-busted visit totals
    expect(stats.totalPointsScored).toBe(120);
    expect(stats.average).toBeCloseTo((120 / 6) * 3);
    expect(stats.dartsPerLeg).toBeNull(); // No legs won
    expect(stats.bestLeg).toBeNull();
    expect(stats.visits60Plus).toBe(2);
  });

  test("handles busted visits correctly", () => {
    const visitHistory: VisitRecord[] = [
      makeVisitRecord("p1", [{ segment: 20, multiplier: 3 }], 60, 441, true), // busted
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        441
      ),
    ];

    const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p2", visitHistory }];

    const stats = calculateX01PlayerStats("p1", completedLegs, 501);
    // Busted visits don't count for visit totals or streaks
    expect(stats.highestVisit).toBe(0);
    expect(stats.visits60Plus).toBe(0);
  });

  test("calculates stats across multiple legs", () => {
    const leg1History: VisitRecord[] = [
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
    const leg2History: VisitRecord[] = [
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

    const completedLegs: CompletedLeg[] = [
      { legNumber: 1, winnerId: "p1", visitHistory: leg1History },
      { legNumber: 2, winnerId: "p2", visitHistory: leg2History },
    ];

    const stats = calculateX01PlayerStats("p1", completedLegs, 301);
    expect(stats.legsPlayed).toBe(2);
    expect(stats.legsWon).toBe(1);
    expect(stats.totalDarts).toBe(6);
    expect(stats.bestLeg).toBe(3);
    expect(stats.dartsPerLeg).toBe(3); // 3 darts in 1 won leg
  });

  test("bestLeg is the minimum across multiple won legs", () => {
    const leg1History: VisitRecord[] = [
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
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 1, multiplier: 1 },
        ],
        121,
        0
      ),
    ];
    const leg2History: VisitRecord[] = [
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
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        0
      ),
    ];

    // leg1 = 6 darts, leg2 = 6 darts
    const completedLegs: CompletedLeg[] = [
      { legNumber: 1, winnerId: "p1", visitHistory: leg1History },
      { legNumber: 2, winnerId: "p1", visitHistory: leg2History },
    ];

    const stats = calculateX01PlayerStats("p1", completedLegs, 301);
    expect(stats.bestLeg).toBe(6); // both legs 6 darts
  });

  test("counts visit milestone thresholds correctly", () => {
    const visitHistory: VisitRecord[] = [
      // 60 exactly
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        441
      ),
      // 100 exactly
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 1 },
        ],
        100,
        341
      ),
      // 140 exactly
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 3 },
        ],
        140,
        201
      ),
      // 180
      makeVisitRecord(
        "p1",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        21
      ),
    ];

    const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p2", visitHistory }];

    const stats = calculateX01PlayerStats("p1", completedLegs, 501);
    expect(stats.visits60Plus).toBe(4); // all 4 are >= 60
    expect(stats.visits100Plus).toBe(3); // 100, 140, 180
    expect(stats.visits140Plus).toBe(2); // 140, 180
    expect(stats.visits180).toBe(1); // only 180
    expect(stats.highestVisit).toBe(180);
  });
});

describe("createEmptyX01Stats", () => {
  test("creates empty stats with player name", () => {
    const stats = createEmptyX01Stats("TestPlayer");
    expect(stats.playerName).toBe("TestPlayer");
    expect(stats.gameType).toBe("x01");
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.legsPlayed).toBe(0);
    expect(stats.legsWon).toBe(0);
    expect(stats.totalDarts).toBe(0);
    expect(stats.totalPointsScored).toBe(0);
    expect(stats.highestVisit).toBe(0);
    expect(stats.bestLeg).toBeNull();
    expect(stats.visits60Plus).toBe(0);
    expect(stats.visits100Plus).toBe(0);
    expect(stats.visits140Plus).toBe(0);
    expect(stats.visits180).toBe(0);
    expect(stats.totalDartsInWonLegs).toBe(0);
    expect(stats.wonLegCount).toBe(0);
  });
});
