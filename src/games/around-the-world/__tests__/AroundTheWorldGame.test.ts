import { describe, expect, test, beforeEach } from "bun:test";
import { AroundTheWorldGame } from "../AroundTheWorldGame";
import type { Player } from "../../../types";
import type { AroundTheWorldConfig } from "../types";

describe("AroundTheWorldGame", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const defaultConfig: AroundTheWorldConfig = {
    legs: 1,
  };

  describe("initialization", () => {
    test("all players start at target 1", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      expect(game.getPlayerTarget("p1")).toBe(1);
      expect(game.getPlayerTarget("p2")).toBe(1);
    });

    test("starts with first player", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      expect(game.isFinished()).toBe(false);
    });

    test("sequence is 1-20 then bull", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      expect(game.getSequenceLength()).toBe(21); // 1-20 + bull
    });
  });

  describe("hitting targets", () => {
    let game: AroundTheWorldGame;

    beforeEach(() => {
      game = new AroundTheWorldGame(players, defaultConfig);
    });

    test("hitting current target advances by 1", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(2);
    });

    test("doubles advance by 2", () => {
      game.recordThrow({ segment: 1, multiplier: 2 });
      expect(game.getPlayerTarget("p1")).toBe(3);
    });

    test("triples advance by 3", () => {
      game.recordThrow({ segment: 1, multiplier: 3 });
      expect(game.getPlayerTarget("p1")).toBe(4);
    });

    test("missing does not advance", () => {
      game.recordThrow({ segment: 5, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("switches player after 3 darts", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getCurrentPlayer().id).toBe("p2");
    });

    test("can advance past multiple targets with doubles/triples", () => {
      game.recordThrow({ segment: 1, multiplier: 3 }); // advance 3: now at 4
      game.recordThrow({ segment: 4, multiplier: 2 }); // advance 2: now at 6
      expect(game.getPlayerTarget("p1")).toBe(6);
    });

    test("triple on target 20 finishes game (caps at sequence end)", () => {
      // Set P1 near the end (target = 20)
      for (let i = 1; i <= 19; i++) {
        game.recordThrow({ segment: i, multiplier: 1 });
        while (game.getCurrentPlayer().id === "p1") {
          game.recordThrow({ segment: 0, multiplier: 1 });
        }
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      // P1 at target 20 (index 19), triple advances 3 -> index 22, capped at 21 = finished
      game.recordThrow({ segment: 20, multiplier: 3 });
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });
  });

  describe("winning", () => {
    test("player wins after hitting bull (final target)", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      // Advance P1 through 1-20
      for (let i = 1; i <= 20; i++) {
        game.recordThrow({ segment: i, multiplier: 1 });
        while (game.getCurrentPlayer().id === "p1") {
          game.recordThrow({ segment: 0, multiplier: 1 });
        }
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      // P1 hits bull
      game.recordThrow({ segment: 25, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("double bull also finishes the game", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      // Advance P1 to bull target
      for (let i = 1; i <= 20; i++) {
        game.recordThrow({ segment: i, multiplier: 1 });
        while (game.getCurrentPlayer().id === "p1") {
          game.recordThrow({ segment: 0, multiplier: 1 });
        }
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      game.recordThrow({ segment: 50, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
    });
  });

  describe("undo", () => {
    let game: AroundTheWorldGame;

    beforeEach(() => {
      game = new AroundTheWorldGame(players, defaultConfig);
    });

    test("undo reverts advancement", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(2);
      game.undoLastThrow();
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("undo reverts double advancement", () => {
      game.recordThrow({ segment: 1, multiplier: 2 });
      expect(game.getPlayerTarget("p1")).toBe(3);
      game.undoLastThrow();
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("returns false when nothing to undo", () => {
      expect(game.undoLastThrow()).toBe(false);
    });
  });

  describe("getPlayerScore returns progress", () => {
    test("returns current target number as score", () => {
      const game = new AroundTheWorldGame(players, defaultConfig);
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 2, multiplier: 1 });
      // P1 is now at target 3, progress = 2 targets hit
      expect(game.getPlayerScore("p1")).toBe(2);
    });
  });
});
