import { describe, expect, test, beforeEach } from "bun:test";
import { X01Game } from "../X01Game";
import type { Player, X01Config } from "../../types";

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
});
