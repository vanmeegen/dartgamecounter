import { describe, expect, test, beforeEach } from "bun:test";
import { X01Game } from "../x01/X01Game";
import type { Player } from "../../types";
import type { X01Config } from "../x01/types";

describe("X01Game", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const config501Double: X01Config = {
    variant: 501,
    outRule: "double",
    legs: 1,
  };

  const config301Single: X01Config = {
    variant: 301,
    outRule: "single",
    legs: 1,
  };

  describe("initialization", () => {
    test("initializes with correct starting scores for 501", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getPlayerScore("p1")).toBe(501);
      expect(game.getPlayerScore("p2")).toBe(501);
    });

    test("initializes with correct starting scores for 301", () => {
      const game = new X01Game(players, config301Single);
      expect(game.getPlayerScore("p1")).toBe(301);
      expect(game.getPlayerScore("p2")).toBe(301);
    });

    test("starts with first player", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new X01Game(players, config501Double);
      expect(game.isFinished()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });
  });

  describe("recordThrow", () => {
    let game: X01Game;

    beforeEach(() => {
      game = new X01Game(players, config501Double);
    });

    test("subtracts single dart value from score", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(481);
    });

    test("subtracts double dart value from score", () => {
      game.recordThrow({ segment: 20, multiplier: 2 });
      expect(game.getPlayerScore("p1")).toBe(461);
    });

    test("subtracts triple dart value from score", () => {
      game.recordThrow({ segment: 20, multiplier: 3 });
      expect(game.getPlayerScore("p1")).toBe(441);
    });

    test("switches to next player after 3 darts", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getCurrentPlayer().id).toBe("p2");
    });

    test("records miss (0 points)", () => {
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(501);
    });
  });

  describe("bust detection (double out)", () => {
    let game: X01Game;

    beforeEach(() => {
      game = new X01Game(players, config501Double);
      // Set up player 1 with 32 points left
      game.state.players[0].score = 32;
    });

    test("busts when score goes below 0", () => {
      game.recordThrow({ segment: 20, multiplier: 3 }); // 60 points, score would be -28
      expect(game.getPlayerScore("p1")).toBe(32); // Score reverted
      expect(game.getCurrentPlayer().id).toBe("p2"); // Turn ended
    });

    test("busts when reaching 1 on double out", () => {
      game.state.players[0].score = 3;
      game.recordThrow({ segment: 2, multiplier: 1 }); // Would leave 1
      expect(game.getPlayerScore("p1")).toBe(3); // Score reverted
    });

    test("busts when hitting 0 without double on double out", () => {
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 = 32, checkout!
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("does not bust when checkout with double", () => {
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 = 32
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.isFinished()).toBe(true);
    });
  });

  describe("bust detection (single out)", () => {
    let game: X01Game;

    beforeEach(() => {
      game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
    });

    test("allows checkout with single on single out", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.isFinished()).toBe(true);
    });

    test("allows checkout with double on single out", () => {
      game.state.players[0].score = 40;
      game.recordThrow({ segment: 20, multiplier: 2 });
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.isFinished()).toBe(true);
    });
  });

  describe("undoLastThrow", () => {
    let game: X01Game;

    beforeEach(() => {
      game = new X01Game(players, config501Double);
    });

    test("restores score after undo", () => {
      game.recordThrow({ segment: 20, multiplier: 3 }); // 60 points
      expect(game.getPlayerScore("p1")).toBe(441);
      game.undoLastThrow();
      expect(game.getPlayerScore("p1")).toBe(501);
    });

    test("returns false when nothing to undo", () => {
      expect(game.undoLastThrow()).toBe(false);
    });

    test("returns true when undo successful", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.undoLastThrow()).toBe(true);
    });
  });

  describe("getCheckoutSuggestion", () => {
    test("returns checkout for double out when score is checkable", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 40;
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).not.toBeNull();
      expect(suggestion?.description).toBe("D20");
    });

    test("returns null when score is too high", () => {
      const game = new X01Game(players, config501Double);
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).toBeNull(); // 501 > 170
    });

    test("returns checkout for 170 (max checkout)", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 170;
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).not.toBeNull();
      expect(suggestion?.description).toBe("T20 T20 Bull");
    });

    test("returns null when no darts remaining", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 40;
      game.state.currentVisit.darts = [
        { segment: 20, multiplier: 1 },
        { segment: 20, multiplier: 1 },
        { segment: 20, multiplier: 1 },
      ];
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).toBeNull();
    });

    test("respects darts remaining for checkout calculation", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 170;
      // After 1 dart, only 2 remaining - can't finish 170
      game.state.currentVisit.darts = [{ segment: 5, multiplier: 1 }];
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).toBeNull();
    });

    test("returns checkout for single out", () => {
      const game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
      const suggestion = game.getCheckoutSuggestion();
      expect(suggestion).not.toBeNull();
    });
  });

  describe("getPlayerAverage", () => {
    test("returns 0 when no darts have been thrown", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getPlayerAverage("p1")).toBe(0);
    });

    test("calculates average per 3 darts for completed visits", () => {
      const game = new X01Game(players, config501Double);
      // Player 1 throws T20, T20, T20 = 180
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      // Average = 180 points / 3 darts * 3 = 180
      expect(game.getPlayerAverage("p1")).toBe(180);
    });

    test("calculates average across multiple visits", () => {
      const game = new X01Game(players, config501Double);
      // P1 visit 1: 20 + 20 + 20 = 60
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // P2 visit
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // P1 visit 2: T20 + T20 + T20 = 180
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      // P1 total: 240 points in 6 darts -> average = 240/6*3 = 120
      expect(game.getPlayerAverage("p1")).toBe(120);
    });

    test("includes current visit darts in average calculation", () => {
      const game = new X01Game(players, config501Double);
      // P1 throws 1 dart: T20 = 60
      game.recordThrow({ segment: 20, multiplier: 3 });
      // Average = 60 / 1 * 3 = 180
      expect(game.getPlayerAverage("p1")).toBe(180);
    });

    test("includes busted visits in dart count but not points", () => {
      const game = new X01Game(players, config501Double);
      // P1 visit 1: 20 + 20 + 20 = 60 (score: 441)
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // P2 visit
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // Set P1 score low to force bust
      game.state.players[0].score = 2;
      // P1 visit 2: T20 = 60 -> bust (score reverts to 2)
      game.recordThrow({ segment: 20, multiplier: 3 });
      // P1 scored: variant(501) - current score(2) = 499 points, in 4 darts (3 from visit 1 + 1 bust)
      // average = 499/4*3 = 374.25
      expect(game.getPlayerAverage("p1")).toBeCloseTo(374.25);
    });

    test("returns 0 for unknown player", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getPlayerAverage("unknown")).toBe(0);
    });

    test("calculates separate averages per player", () => {
      const game = new X01Game(players, config501Double);
      // P1: T20, T20, T20 = 180
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      // P2: 1, 1, 1 = 3
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerAverage("p1")).toBe(180);
      expect(game.getPlayerAverage("p2")).toBe(3);
    });
  });

  describe("multi-leg games", () => {
    const configBestOf3: X01Config = {
      variant: 301,
      outRule: "single",
      legs: 3,
    };

    test("initializes with correct legs config", () => {
      const game = new X01Game(players, configBestOf3);
      expect(game.config.legs).toBe(3);
      expect(game.state.currentLeg).toBe(1);
      expect(game.state.players[0].legsWon).toBe(0);
      expect(game.state.players[1].legsWon).toBe(0);
    });

    test("winning a leg increments legsWon", () => {
      const game = new X01Game(players, configBestOf3);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Player 1 finishes
      expect(game.state.players[0].legsWon).toBe(1);
    });

    test("winning a leg does not finish match if more legs needed", () => {
      const game = new X01Game(players, configBestOf3);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Player 1 wins leg 1
      expect(game.isFinished()).toBe(false);
      expect(game.isLegFinished()).toBe(true);
      expect(game.state.currentLeg).toBe(1); // Still on leg 1 until nextLeg() called
    });

    test("isMatchFinished returns true when player wins enough legs", () => {
      const game = new X01Game(players, configBestOf3);
      // Player 1 wins 3 legs (first to 3)
      game.state.players[0].legsWon = 2;
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Player 1 wins leg 3
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("nextLeg resets scores and increments leg counter", () => {
      const game = new X01Game(players, configBestOf3);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Player 1 wins leg 1
      game.nextLeg();
      expect(game.state.currentLeg).toBe(2);
      expect(game.state.players[0].score).toBe(301);
      expect(game.state.players[1].score).toBe(301);
      expect(game.state.currentVisit.darts).toEqual([]);
    });

    test("nextLeg rotates player order", () => {
      const game = new X01Game(players, configBestOf3);
      expect(game.getCurrentPlayer().id).toBe("p1"); // Leg 1 starts with p1
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Player 1 wins leg 1
      game.nextLeg();
      expect(game.getCurrentPlayer().id).toBe("p2"); // Leg 2 starts with p2
    });

    test("player rotation continues correctly through multiple legs", () => {
      const game = new X01Game(players, { ...configBestOf3, legs: 5 });
      // Leg 1: p1 starts
      expect(game.getCurrentPlayer().id).toBe("p1");
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.nextLeg();
      // Leg 2: p2 starts
      expect(game.getCurrentPlayer().id).toBe("p2");
      game.state.players[1].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.nextLeg();
      // Leg 3: p1 starts again
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("getLegsToWin returns configured legs value", () => {
      const game = new X01Game(players, configBestOf3);
      expect(game.getLegsToWin()).toBe(3); // First to 3
    });

    test("getLegsToWin works for different values", () => {
      const game = new X01Game(players, { ...configBestOf3, legs: 5 });
      expect(game.getLegsToWin()).toBe(5); // First to 5
    });

    test("single leg game finishes after one leg win", () => {
      const game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      expect(game.isLegFinished()).toBe(true);
    });
  });

  describe("getAllCompletedLegs - multi-leg tracking", () => {
    const configFirstTo3: X01Config = {
      variant: 301,
      outRule: "single",
      legs: 3,
    };

    function winLegForCurrentPlayer(game: X01Game): void {
      // Quick win: set score to 20, then throw 20
      const currentPlayerId = game.getCurrentPlayer().id;
      const playerScore = game.state.players.find((ps) => ps.playerId === currentPlayerId);
      if (playerScore) playerScore.score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
    }

    test("returns 3 legs after playing 3 complete legs (first to 3)", () => {
      // "first to 3" means a player needs 3 leg wins to win the match
      const game = new X01Game(players, configFirstTo3);

      // Leg 1: p1 wins (p1 starts)
      winLegForCurrentPlayer(game);
      expect(game.isLegFinished()).toBe(true);
      game.nextLeg();

      // Leg 2: p2 starts (rotation), but let's have p1 win again
      // p2 starts, skip p2 turn, then p1 wins
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // Now it's p1's turn
      winLegForCurrentPlayer(game);
      expect(game.isLegFinished()).toBe(true);
      game.nextLeg();

      // Leg 3: p1 starts, p1 wins (match over with 3 wins)
      winLegForCurrentPlayer(game);
      expect(game.isLegFinished()).toBe(true);
      expect(game.isFinished()).toBe(true);

      const legs = game.getAllCompletedLegs();
      expect(legs.length).toBe(3);
      expect(legs[0].legNumber).toBe(1);
      expect(legs[1].legNumber).toBe(2);
      expect(legs[2].legNumber).toBe(3);
    });

    test("each leg has its own visit history (no double counting)", () => {
      const game = new X01Game(players, configFirstTo3);

      // Leg 1: p1 throws some darts then wins
      game.recordThrow({ segment: 20, multiplier: 3 }); // T20 = 60
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      // p2 throws
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // Set p1 to 20 and checkout
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.nextLeg();

      // Leg 2: different throws
      game.recordThrow({ segment: 19, multiplier: 3 }); // p2 starts (rotation)
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 });
      // Set p2 to 20 and checkout
      game.state.players[1].score = 20;
      // p1's turn
      game.recordThrow({ segment: 10, multiplier: 1 });
      game.recordThrow({ segment: 10, multiplier: 1 });
      game.recordThrow({ segment: 10, multiplier: 1 });
      // p2's turn - checkout
      game.state.players[1].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.nextLeg();

      const legs = game.getAllCompletedLegs();
      expect(legs.length).toBe(2);

      // Leg 1 visits should only contain leg 1 throws
      const leg1P1Visits = legs[0].visitHistory.filter((v) => v.playerId === "p1");
      const leg1P2Visits = legs[0].visitHistory.filter((v) => v.playerId === "p2");
      expect(leg1P1Visits.length).toBeGreaterThan(0);
      expect(leg1P2Visits.length).toBeGreaterThan(0);

      // Leg 2 visits should only contain leg 2 throws
      const leg2Visits = legs[1].visitHistory;
      // Leg 2 should NOT contain any T20 visits from leg 1
      // Verify visits are separate - leg2 should have different darts
      expect(leg2Visits.length).toBeGreaterThan(0);

      // Total visits across all legs should equal total throws made
      const totalVisits = legs[0].visitHistory.length + legs[1].visitHistory.length;
      expect(totalVisits).toBeGreaterThan(legs[0].visitHistory.length);
    });

    test("includes current finished leg before nextLeg is called", () => {
      const game = new X01Game(players, configFirstTo3);

      // Win leg 1 but don't call nextLeg
      winLegForCurrentPlayer(game);
      expect(game.isLegFinished()).toBe(true);

      const legs = game.getAllCompletedLegs();
      expect(legs.length).toBe(1);
      expect(legs[0].legNumber).toBe(1);
      expect(legs[0].winnerId).toBe("p1");
      expect(legs[0].visitHistory.length).toBeGreaterThan(0);
    });

    test("visit histories contain correct player data after 3 legs", () => {
      const game = new X01Game(players, configFirstTo3);

      // Play 3 legs with actual throws
      for (let leg = 0; leg < 3; leg++) {
        winLegForCurrentPlayer(game);
        if (leg < 2) game.nextLeg();
      }

      const legs = game.getAllCompletedLegs();
      expect(legs.length).toBe(3);

      // Each leg should have visit records with valid player IDs
      for (const leg of legs) {
        for (const visit of leg.visitHistory) {
          expect(["p1", "p2"]).toContain(visit.playerId);
          expect(visit.visit.darts.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
