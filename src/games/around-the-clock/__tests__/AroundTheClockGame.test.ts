import { describe, expect, test, beforeEach } from "bun:test";
import { AroundTheClockGame } from "../AroundTheClockGame";
import type { Player } from "../../../types";
import type { AroundTheClockConfig } from "../types";

describe("AroundTheClockGame", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const defaultConfig: AroundTheClockConfig = {
    includesBull: false,
    doublesAdvanceExtra: false,
    legs: 1,
  };

  describe("initialization", () => {
    test("all players start at target 1", () => {
      const game = new AroundTheClockGame(players, defaultConfig);
      expect(game.getPlayerTarget("p1")).toBe(1);
      expect(game.getPlayerTarget("p2")).toBe(1);
    });

    test("getPlayerScore returns current target as progress", () => {
      const game = new AroundTheClockGame(players, defaultConfig);
      expect(game.getPlayerScore("p1")).toBe(1);
    });

    test("starts with first player", () => {
      const game = new AroundTheClockGame(players, defaultConfig);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new AroundTheClockGame(players, defaultConfig);
      expect(game.isFinished()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });
  });

  describe("hitting targets", () => {
    let game: AroundTheClockGame;

    beforeEach(() => {
      game = new AroundTheClockGame(players, defaultConfig);
    });

    test("hitting current target advances to next number", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(2);
    });

    test("missing current target does not advance", () => {
      game.recordThrow({ segment: 5, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("doubles count as hitting the target (advance by 1 in standard mode)", () => {
      game.recordThrow({ segment: 1, multiplier: 2 });
      expect(game.getPlayerTarget("p1")).toBe(2);
    });

    test("triples count as hitting the target (advance by 1 in standard mode)", () => {
      game.recordThrow({ segment: 1, multiplier: 3 });
      expect(game.getPlayerTarget("p1")).toBe(2);
    });

    test("switches player after 3 darts", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      game.recordThrow({ segment: 2, multiplier: 1 });
      game.recordThrow({ segment: 3, multiplier: 1 });
      expect(game.getCurrentPlayer().id).toBe("p2");
    });

    test("can hit multiple targets in one visit", () => {
      game.recordThrow({ segment: 1, multiplier: 1 }); // hit 1 -> now 2
      game.recordThrow({ segment: 2, multiplier: 1 }); // hit 2 -> now 3
      game.recordThrow({ segment: 3, multiplier: 1 }); // hit 3 -> now 4
      expect(game.getPlayerTarget("p1")).toBe(4);
    });

    test("miss dart (segment 0) does not advance", () => {
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(1);
    });
  });

  describe("doubles advance extra mode", () => {
    test("doubles advance by 2 when enabled", () => {
      const config: AroundTheClockConfig = {
        ...defaultConfig,
        doublesAdvanceExtra: true,
      };
      const game = new AroundTheClockGame(players, config);
      game.recordThrow({ segment: 1, multiplier: 2 });
      expect(game.getPlayerTarget("p1")).toBe(3); // advanced by 2
    });

    test("triples advance by 3 when enabled", () => {
      const config: AroundTheClockConfig = {
        ...defaultConfig,
        doublesAdvanceExtra: true,
      };
      const game = new AroundTheClockGame(players, config);
      game.recordThrow({ segment: 1, multiplier: 3 });
      expect(game.getPlayerTarget("p1")).toBe(4); // advanced by 3
    });

    test("singles still advance by 1 when doubles extra enabled", () => {
      const config: AroundTheClockConfig = {
        ...defaultConfig,
        doublesAdvanceExtra: true,
      };
      const game = new AroundTheClockGame(players, config);
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(2);
    });
  });

  describe("winning", () => {
    test("player wins after hitting 20 (no bull mode)", () => {
      const game = new AroundTheClockGame(players, defaultConfig);
      // Advance P1 to target 20
      for (let i = 1; i <= 19; i++) {
        game.recordThrow({ segment: i, multiplier: 1 });
        // Fill remaining darts with misses
        while (game.getCurrentPlayer().id === "p1") {
          game.recordThrow({ segment: 0, multiplier: 1 });
        }
        // P2 misses all
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      // P1 hits 20
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("player needs bull after 20 when includesBull is true", () => {
      const config: AroundTheClockConfig = {
        ...defaultConfig,
        includesBull: true,
      };
      const game = new AroundTheClockGame(players, config);
      // Set P1 to target 20
      for (let i = 1; i <= 19; i++) {
        game.recordThrow({ segment: i, multiplier: 1 });
        while (game.getCurrentPlayer().id === "p1") {
          game.recordThrow({ segment: 0, multiplier: 1 });
        }
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      }
      // P1 hits 20
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.isFinished()).toBe(false); // Still need bull
      // Fill visit
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2 turn
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P1 hits bull
      game.recordThrow({ segment: 25, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });
  });

  describe("undo", () => {
    let game: AroundTheClockGame;

    beforeEach(() => {
      game = new AroundTheClockGame(players, defaultConfig);
    });

    test("undo reverts target advancement", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.getPlayerTarget("p1")).toBe(2);
      game.undoLastThrow();
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("undo of miss keeps target unchanged", () => {
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.undoLastThrow();
      expect(game.getPlayerTarget("p1")).toBe(1);
    });

    test("returns false when nothing to undo", () => {
      expect(game.undoLastThrow()).toBe(false);
    });

    test("returns true on successful undo", () => {
      game.recordThrow({ segment: 1, multiplier: 1 });
      expect(game.undoLastThrow()).toBe(true);
    });
  });
});
