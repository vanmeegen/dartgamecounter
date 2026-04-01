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

describe("calculateX01PlayerStats - multi-leg scenarios", () => {
  /**
   * Helper: build a realistic completed leg for 501 with 2 players.
   * Winner checks out, loser has partial score remaining.
   */
  function buildRealistic501Leg(
    winnerId: string,
    loserId: string,
    winnerVisits: {
      darts: { segment: number; multiplier: 1 | 2 | 3 }[];
      total: number;
      scoreAfter: number;
      busted?: boolean;
    }[],
    loserVisits: {
      darts: { segment: number; multiplier: 1 | 2 | 3 }[];
      total: number;
      scoreAfter: number;
      busted?: boolean;
    }[]
  ): CompletedLeg {
    // Interleave visits: winner, loser, winner, loser, ...
    const visitHistory: VisitRecord[] = [];
    const maxLen = Math.max(winnerVisits.length, loserVisits.length);
    for (let i = 0; i < maxLen; i++) {
      const wv = winnerVisits[i];
      if (wv) {
        visitHistory.push(makeVisitRecord(winnerId, wv.darts, wv.total, wv.scoreAfter, wv.busted));
      }
      const lv = loserVisits[i];
      if (lv) {
        visitHistory.push(makeVisitRecord(loserId, lv.darts, lv.total, lv.scoreAfter, lv.busted));
      }
    }
    return { legNumber: 0, winnerId, visitHistory };
  }

  test("correct average for a 3-leg 501 game where p1 wins all legs", () => {
    // Leg 1: p1 wins in 15 darts (5 visits of 3 darts), p2 throws 15 darts
    // p1: 100, 100, 100, 100, 101 (checkout) = 501 in 15 darts
    // p2: 60, 60, 60, 60, 60 = 300 in 15 darts
    const p1Leg1Visits = [
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 401,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 301,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 201,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 101,
      },
      {
        darts: [
          { segment: 19, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 12, multiplier: 2 as const },
        ],
        total: 101,
        scoreAfter: 0,
      },
    ];
    const p2Leg1Visits = [
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 441,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 381,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 321,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 261,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 201,
      },
    ];
    const leg1 = buildRealistic501Leg("p1", "p2", p1Leg1Visits, p2Leg1Visits);
    leg1.legNumber = 1;

    // Legs 2 and 3: same structure for simplicity
    const leg2 = buildRealistic501Leg("p1", "p2", p1Leg1Visits, p2Leg1Visits);
    leg2.legNumber = 2;
    const leg3 = buildRealistic501Leg("p1", "p2", p1Leg1Visits, p2Leg1Visits);
    leg3.legNumber = 3;

    const completedLegs = [leg1, leg2, leg3];

    // p1 stats: won all 3 legs, 15 darts per leg = 45 total darts
    // totalPointsScored = 501 * 3 = 1503 (winner gets gameVariant per leg)
    // average = (1503 / 45) * 3 = 100.2
    const p1Stats = calculateX01PlayerStats("p1", completedLegs, 501);
    expect(p1Stats.legsPlayed).toBe(3);
    expect(p1Stats.legsWon).toBe(3);
    expect(p1Stats.totalDarts).toBe(45);
    expect(p1Stats.totalPointsScored).toBe(1503);
    expect(p1Stats.average).toBeCloseTo(100.2);
    expect(p1Stats.dartsPerLeg).toBe(15);
    expect(p1Stats.bestLeg).toBe(15);
    expect(p1Stats.totalDartsInWonLegs).toBe(45);

    // p2 stats: lost all 3 legs, 15 darts per leg = 45 total darts
    // totalPointsScored = 300 * 3 = 900 (sum of non-busted visits)
    // average = (900 / 45) * 3 = 60
    const p2Stats = calculateX01PlayerStats("p2", completedLegs, 501);
    expect(p2Stats.legsPlayed).toBe(3);
    expect(p2Stats.legsWon).toBe(0);
    expect(p2Stats.totalDarts).toBe(45);
    expect(p2Stats.totalPointsScored).toBe(900);
    expect(p2Stats.average).toBeCloseTo(60);
    expect(p2Stats.dartsPerLeg).toBeNull();
    expect(p2Stats.bestLeg).toBeNull();
    expect(p2Stats.totalDartsInWonLegs).toBe(0);
  });

  test("correct average when players alternate winning legs", () => {
    // p1 wins leg 1 in 12 darts, p2 wins leg 2 in 18 darts, p1 wins leg 3 in 15 darts
    const p1WinVisits12 = [
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
        ],
        total: 180,
        scoreAfter: 321,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
        ],
        total: 180,
        scoreAfter: 141,
      },
      {
        darts: [
          { segment: 19, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
          { segment: 12, multiplier: 2 as const },
        ],
        total: 141,
        scoreAfter: 0,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
        ],
        total: 180,
        scoreAfter: 0,
      },
    ];
    // Only 4 visits for winner (12 darts), 4 visits for loser
    const p2LoseVisits = [
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 441,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 381,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 321,
      },
    ];

    // Leg 1: p1 wins in 9 darts (first 3 visits), p2 throws 9 darts
    const leg1 = buildRealistic501Leg("p1", "p2", p1WinVisits12.slice(0, 3), p2LoseVisits);
    leg1.legNumber = 1;

    // Leg 2: p2 wins in 18 darts (6 visits), p1 throws 18 darts (6 visits)
    const p2WinLeg2 = [
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 441,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 381,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 321,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 261,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 3 as const },
        ],
        total: 180,
        scoreAfter: 81,
      },
      {
        darts: [
          { segment: 19, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 2, multiplier: 2 as const },
        ],
        total: 81,
        scoreAfter: 0,
      },
    ];
    const p1LoseLeg2 = [
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 441,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 381,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 321,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 261,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 201,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 141,
      },
    ];
    const leg2 = buildRealistic501Leg("p2", "p1", p2WinLeg2, p1LoseLeg2);
    leg2.legNumber = 2;

    // Leg 3: p1 wins in 15 darts (same as before)
    const p1WinLeg3 = [
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 401,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 301,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 201,
      },
      {
        darts: [
          { segment: 20, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 100,
        scoreAfter: 101,
      },
      {
        darts: [
          { segment: 19, multiplier: 3 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 12, multiplier: 2 as const },
        ],
        total: 101,
        scoreAfter: 0,
      },
    ];
    const p2LoseLeg3 = [
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 441,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 381,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 321,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 261,
      },
      {
        darts: [
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
          { segment: 20, multiplier: 1 as const },
        ],
        total: 60,
        scoreAfter: 201,
      },
    ];
    const leg3 = buildRealistic501Leg("p1", "p2", p1WinLeg3, p2LoseLeg3);
    leg3.legNumber = 3;

    const completedLegs = [leg1, leg2, leg3];

    // p1: won leg1 (9 darts) + lost leg2 (18 darts) + won leg3 (15 darts) = 42 darts
    // totalPointsScored: leg1=501(winner) + leg2=360(loser, 6*60) + leg3=501(winner) = 1362
    // average = (1362 / 42) * 3 = 97.29
    const p1Stats = calculateX01PlayerStats("p1", completedLegs, 501);
    expect(p1Stats.legsPlayed).toBe(3);
    expect(p1Stats.legsWon).toBe(2);
    expect(p1Stats.totalDarts).toBe(42);
    expect(p1Stats.totalPointsScored).toBe(1362);
    expect(p1Stats.average).toBeCloseTo((1362 / 42) * 3);
    // Won legs: 9 darts + 15 darts = 24 totalDartsInWonLegs
    expect(p1Stats.totalDartsInWonLegs).toBe(24);
    expect(p1Stats.dartsPerLeg).toBe(12); // 24 / 2
    expect(p1Stats.bestLeg).toBe(9);

    // p2: lost leg1 (9 darts, 3 visits) + won leg2 (18 darts) + lost leg3 (15 darts) = 42 darts
    // totalPointsScored: leg1=180(loser, 3*60) + leg2=501(winner) + leg3=300(loser, 5*60) = 981
    const p2Stats = calculateX01PlayerStats("p2", completedLegs, 501);
    expect(p2Stats.legsPlayed).toBe(3);
    expect(p2Stats.legsWon).toBe(1);
    expect(p2Stats.totalDarts).toBe(42);
    expect(p2Stats.totalPointsScored).toBe(981);
    expect(p2Stats.average).toBeCloseTo((981 / 42) * 3);
    expect(p2Stats.totalDartsInWonLegs).toBe(18);
    expect(p2Stats.dartsPerLeg).toBe(18);
    expect(p2Stats.bestLeg).toBe(18);
  });

  test("average with busted visits in multi-leg game", () => {
    // Leg with a bust: p1 busts once, then wins
    const leg1Visits: VisitRecord[] = [
      // p1 throws 180
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
      // p2 throws 60
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
      // p1 busts! (1 dart, T20=60 when score is 321, goes to 261... actually not a bust)
      // Let's make a real bust: p1 has 321, throws T20 T20 T20 = 180 -> 141, then
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
      // p2 throws 60
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
      // p1 busts: score 141, throws T20 T20 = 120 -> 21, then T20=60 -> -39 = bust
      makeVisitRecord("p1", [{ segment: 20, multiplier: 3 }], 60, 141, true), // busted, score reverts to 141
      // p2 throws 60
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
          { segment: 20, multiplier: 1 },
        ],
        60,
        321
      ),
      // p1 wins: 141 checkout
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

    const completedLegs: CompletedLeg[] = [
      { legNumber: 1, winnerId: "p1", visitHistory: leg1Visits },
    ];

    const stats = calculateX01PlayerStats("p1", completedLegs, 501);
    // p1 threw: 3 + 3 + 1(bust) + 3 = 10 darts
    expect(stats.totalDarts).toBe(10);
    // Winner gets gameVariant as totalPointsScored
    expect(stats.totalPointsScored).toBe(501);
    // average = (501 / 10) * 3 = 150.3
    expect(stats.average).toBeCloseTo(150.3);
    // totalDartsInWonLegs = 10 (won this leg in 10 darts)
    expect(stats.totalDartsInWonLegs).toBe(10);
    // highestVisit should be 180 (busted visit of 60 is excluded)
    expect(stats.highestVisit).toBe(180);
    // visits: 180, 180, 141 are non-busted
    expect(stats.visits180).toBe(2);
    expect(stats.visits140Plus).toBe(3);
  });

  test("totalDartsInWonLegs is zero when player wins no legs", () => {
    const visitHistory: VisitRecord[] = [
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
      makeVisitRecord(
        "p2",
        [
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
          { segment: 20, multiplier: 3 },
        ],
        180,
        321
      ),
    ];
    const completedLegs: CompletedLeg[] = [{ legNumber: 1, winnerId: "p2", visitHistory }];

    const stats = calculateX01PlayerStats("p1", completedLegs, 501);
    expect(stats.totalDartsInWonLegs).toBe(0);
    expect(stats.dartsPerLeg).toBeNull();
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
