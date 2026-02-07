/**
 * Additional coverage tests for X01Game - uncovered methods and branches
 */

import { describe, expect, test } from "bun:test";
import { X01Game } from "../x01/X01Game";
import type { Player } from "../../types";
import type { X01Config } from "../x01/types";

describe("X01Game - additional coverage", () => {
  const players: Player[] = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ];

  const config501Double: X01Config = {
    variant: 501,
    outRule: "double",
    legs: 1,
  };

  const config301Single: X01Config = {
    variant: 301,
    outRule: "single",
    legs: 3,
  };

  describe("getPlayerLegsWon", () => {
    test("returns 0 for player at start", () => {
      const game = new X01Game(players, config301Single);
      expect(game.getPlayerLegsWon("p1")).toBe(0);
      expect(game.getPlayerLegsWon("p2")).toBe(0);
    });

    test("returns correct legs won after winning a leg", () => {
      const game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // P1 wins leg
      expect(game.getPlayerLegsWon("p1")).toBe(1);
      expect(game.getPlayerLegsWon("p2")).toBe(0);
    });

    test("returns 0 for unknown player id", () => {
      const game = new X01Game(players, config301Single);
      expect(game.getPlayerLegsWon("unknown")).toBe(0);
    });
  });

  describe("getDartsRemaining", () => {
    test("returns 3 at start of visit", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getDartsRemaining()).toBe(3);
    });

    test("returns 2 after 1 dart", () => {
      const game = new X01Game(players, config501Double);
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getDartsRemaining()).toBe(2);
    });

    test("returns 1 after 2 darts", () => {
      const game = new X01Game(players, config501Double);
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getDartsRemaining()).toBe(1);
    });

    test("returns 0 after 3 darts (visit complete)", () => {
      const game = new X01Game(players, config501Double);
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // After 3 darts, visit resets for next player
      // So darts remaining should be 3 for next player
      expect(game.getDartsRemaining()).toBe(3);
    });
  });

  describe("getAllCompletedLegs", () => {
    test("returns empty array when no legs completed", () => {
      const game = new X01Game(players, config301Single);
      expect(game.getAllCompletedLegs()).toEqual([]);
    });

    test("includes current leg when it is finished", () => {
      const game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // P1 wins leg 1
      // Leg is finished but not yet advanced via nextLeg
      expect(game.isLegFinished()).toBe(true);
      const legs = game.getAllCompletedLegs();
      expect(legs).toHaveLength(1);
      expect(legs[0].legNumber).toBe(1);
      expect(legs[0].winnerId).toBe("p1");
    });

    test("includes both stored and current finished leg", () => {
      const game = new X01Game(players, config301Single);
      // Win leg 1
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.nextLeg();

      // Win leg 2
      game.state.players[1].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // P2 starts leg 2
      // Leg 2 is finished
      const legs = game.getAllCompletedLegs();
      expect(legs).toHaveLength(2); // leg 1 (stored) + leg 2 (current finished)
    });
  });

  describe("recordThrow - edge cases", () => {
    test("does not record throw when game is finished", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 32;
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 checkout
      expect(game.isFinished()).toBe(true);

      // Try to throw again - should be ignored
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("does not record throw when leg is finished (waiting for nextLeg)", () => {
      const game = new X01Game(players, config301Single);
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Win leg
      expect(game.isLegFinished()).toBe(true);

      // P2 should not be able to throw
      game.recordThrow({ segment: 20, multiplier: 1 });
    });

    test("does not record more than 3 darts in a visit", () => {
      const game = new X01Game(players, config501Double);
      // Manually set 3 darts without triggering endVisit
      game.state.currentVisit.darts = [
        { segment: 20, multiplier: 1 },
        { segment: 20, multiplier: 1 },
        { segment: 20, multiplier: 1 },
      ];
      game.recordThrow({ segment: 20, multiplier: 1 });
      // Should still be 3 darts (4th ignored)
      expect(game.state.currentVisit.darts.length).toBe(3);
    });
  });

  describe("nextLeg - edge cases", () => {
    test("does nothing when leg is not finished", () => {
      const game = new X01Game(players, config301Single);
      game.nextLeg();
      expect(game.state.currentLeg).toBe(1); // No change
    });

    test("does nothing when match is finished", () => {
      const game = new X01Game(players, { ...config301Single, legs: 1 });
      game.state.players[0].score = 20;
      game.recordThrow({ segment: 20, multiplier: 1 }); // Win match
      expect(game.isFinished()).toBe(true);
      game.nextLeg();
      expect(game.state.currentLeg).toBe(1); // No change
    });
  });

  describe("undoLastThrow - undo previous visit", () => {
    test("undoes a complete previous visit", () => {
      const game = new X01Game(players, config501Double);
      // P1 throws 3 darts (visit ends, switches to P2)
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 20, multiplier: 1 });
      // P2 is now current
      expect(game.getCurrentPlayer().id).toBe("p2");

      // Undo should go back to P1's last visit
      const result = game.undoLastThrow();
      expect(result).toBe(true);
      expect(game.getCurrentPlayer().id).toBe("p1");
      // Score should be partially restored (2 darts of the visit remain)
      expect(game.state.currentVisit.darts.length).toBe(2);
    });

    test("undoes a busted visit correctly", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 2;
      // P1 throws bust (score reverts)
      game.recordThrow({ segment: 20, multiplier: 1 }); // Would go to -18, bust
      expect(game.getPlayerScore("p1")).toBe(2); // Reverted
      expect(game.getCurrentPlayer().id).toBe("p2"); // Moved to P2

      // Undo the busted visit
      const result = game.undoLastThrow();
      expect(result).toBe(true);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("undo of checkout goes through history path and restores partial visit", () => {
      const game = new X01Game(players, config501Double);
      game.state.players[0].score = 32;
      game.recordThrow({ segment: 16, multiplier: 2 }); // D16 checkout - visit ends, goes to history
      expect(game.isFinished()).toBe(true);
      // Current visit is empty after endVisit
      expect(game.state.currentVisit.darts.length).toBe(0);

      // Undo pops from history, removes last dart, restores partial visit
      const result = game.undoLastThrow();
      expect(result).toBe(true);
      // The visit had only 1 dart, so after popping last dart, 0 darts remain
      expect(game.state.currentVisit.darts.length).toBe(0);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("undo within current visit clears finished state (multi-dart checkout)", () => {
      const game = new X01Game(players, config501Double);
      // Set score to 72 so we need 2 darts: T20(60) then D6(12) but without triggering endVisit
      game.state.players[0].score = 72;
      game.recordThrow({ segment: 20, multiplier: 3 }); // T20 = 60, score now 12
      expect(game.getPlayerScore("p1")).toBe(12);
      // Dart is still in current visit (1 of 3)
      expect(game.state.currentVisit.darts.length).toBe(1);
      expect(game.isFinished()).toBe(false);

      // Undo within current visit
      const result = game.undoLastThrow();
      expect(result).toBe(true);
      expect(game.getPlayerScore("p1")).toBe(72);
      expect(game.state.currentVisit.darts.length).toBe(0);
    });
  });

  describe("getPlayerScore", () => {
    test("returns 0 for unknown player", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getPlayerScore("unknown")).toBe(0);
    });
  });

  describe("getWinner", () => {
    test("returns null when no winner (winnerId is null)", () => {
      const game = new X01Game(players, config501Double);
      expect(game.getWinner()).toBeNull();
    });

    test("returns null when winnerId doesn't match any player", () => {
      const game = new X01Game(players, config501Double);
      game.state.winnerId = "nonexistent";
      expect(game.getWinner()).toBeNull();
    });
  });
});
