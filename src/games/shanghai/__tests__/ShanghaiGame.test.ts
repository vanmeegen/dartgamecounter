import { describe, expect, test, beforeEach } from "bun:test";
import { ShanghaiGame } from "../ShanghaiGame";
import type { Player } from "../../../types";
import type { ShanghaiConfig } from "../types";

describe("ShanghaiGame", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const defaultConfig: ShanghaiConfig = {
    rounds: 7,
    startNumber: 1,
    legs: 1,
  };

  describe("initialization", () => {
    test("starts on round 1 targeting number 1", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      expect(game.getCurrentRound()).toBe(1);
      expect(game.getCurrentTargetNumber()).toBe(1);
    });

    test("all players start with 0 score", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.getPlayerScore("p2")).toBe(0);
    });

    test("starts with first player", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      expect(game.isFinished()).toBe(false);
    });
  });

  describe("scoring", () => {
    let game: ShanghaiGame;

    beforeEach(() => {
      game = new ShanghaiGame(players, defaultConfig);
    });

    test("hitting target number scores points", () => {
      game.recordThrow({ segment: 1, multiplier: 1 }); // single 1 = 1 point
      expect(game.getPlayerScore("p1")).toBe(1);
    });

    test("double of target scores double points", () => {
      game.recordThrow({ segment: 1, multiplier: 2 }); // double 1 = 2 points
      expect(game.getPlayerScore("p1")).toBe(2);
    });

    test("triple of target scores triple points", () => {
      game.recordThrow({ segment: 1, multiplier: 3 }); // triple 1 = 3 points
      expect(game.getPlayerScore("p1")).toBe(3);
    });

    test("hitting wrong number scores 0", () => {
      game.recordThrow({ segment: 5, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("miss scores 0", () => {
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("scores accumulate across rounds", () => {
      // Round 1 (target 1): P1 scores
      game.recordThrow({ segment: 1, multiplier: 3 }); // 3 points
      game.recordThrow({ segment: 1, multiplier: 1 }); // 1 point
      game.recordThrow({ segment: 0, multiplier: 1 }); // miss
      // P2 turn
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // Round 2 (target 2): P1 scores
      game.recordThrow({ segment: 2, multiplier: 2 }); // 4 points
      expect(game.getPlayerScore("p1")).toBe(8); // 3 + 1 + 4
    });
  });

  describe("round progression", () => {
    let game: ShanghaiGame;

    beforeEach(() => {
      game = new ShanghaiGame(players, defaultConfig);
    });

    test("advances to round 2 after all players throw", () => {
      // P1 round 1
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // P2 round 1
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // Now round 2
      expect(game.getCurrentRound()).toBe(2);
      expect(game.getCurrentTargetNumber()).toBe(2);
    });

    test("target number increments each round", () => {
      const config: ShanghaiConfig = { ...defaultConfig, startNumber: 15 };
      const game = new ShanghaiGame(players, config);
      expect(game.getCurrentTargetNumber()).toBe(15);
      // Complete round 1 for both players
      for (let i = 0; i < 6; i++) {
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      expect(game.getCurrentTargetNumber()).toBe(16);
    });
  });

  describe("Shanghai instant win", () => {
    test("hitting single + double + triple in one visit is Shanghai (instant win)", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      game.recordThrow({ segment: 1, multiplier: 1 }); // single
      game.recordThrow({ segment: 1, multiplier: 2 }); // double
      game.recordThrow({ segment: 1, multiplier: 3 }); // triple = Shanghai!
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("order of single/double/triple doesn't matter for Shanghai", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      game.recordThrow({ segment: 1, multiplier: 3 }); // triple first
      game.recordThrow({ segment: 1, multiplier: 1 }); // single
      game.recordThrow({ segment: 1, multiplier: 2 }); // double = Shanghai!
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("non-target Shanghai does not count", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      // Round 1, target is 1, but hitting 5s
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.recordThrow({ segment: 5, multiplier: 2 });
      game.recordThrow({ segment: 5, multiplier: 3 });
      expect(game.isFinished()).toBe(false);
    });
  });

  describe("game ending (normal)", () => {
    test("game ends after all rounds completed", () => {
      const config: ShanghaiConfig = { rounds: 2, startNumber: 1, legs: 1 };
      const game = new ShanghaiGame(players, config);
      // Round 1: both players throw 3 darts
      for (let i = 0; i < 6; i++) {
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      // Round 2: both players throw 3 darts
      for (let i = 0; i < 6; i++) {
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      expect(game.isFinished()).toBe(true);
    });

    test("highest score wins when all rounds complete", () => {
      const config: ShanghaiConfig = { rounds: 1, startNumber: 1, legs: 1 };
      const game = new ShanghaiGame(players, config);
      // P1 scores 6
      game.recordThrow({ segment: 1, multiplier: 3 });
      game.recordThrow({ segment: 1, multiplier: 2 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // This is a Shanghai! - instant win
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("highest score wins without Shanghai", () => {
      const config: ShanghaiConfig = { rounds: 1, startNumber: 1, legs: 1 };
      const game = new ShanghaiGame(players, config);
      // P1: scores 3 (no Shanghai since no single+double+triple)
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      // P2: scores 2
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });
  });

  describe("undo", () => {
    test("undo removes score from player", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(1);
      game.undoLastThrow();
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("returns false when nothing to undo", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      expect(game.undoLastThrow()).toBe(false);
    });

    test("undo clears Shanghai/finished state", () => {
      const game = new ShanghaiGame(players, defaultConfig);
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 1, multiplier: 2 });
      game.recordThrow({ segment: 1, multiplier: 3 }); // Shanghai!
      expect(game.isFinished()).toBe(true);
      game.undoLastThrow();
      expect(game.isFinished()).toBe(false);
    });
  });
});
