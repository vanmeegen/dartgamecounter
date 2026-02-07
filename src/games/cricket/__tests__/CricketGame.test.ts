import { describe, expect, test, beforeEach } from "bun:test";
import { CricketGame } from "../CricketGame";
import type { Player } from "../../../types";
import type { CricketConfig } from "../types";

describe("CricketGame", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const defaultConfig: CricketConfig = {
    marksToClose: 3,
    legs: 1,
  };

  describe("initialization", () => {
    test("initializes with 0 marks on all cricket numbers", () => {
      const game = new CricketGame(players, defaultConfig);
      const marks = game.getPlayerMarks("p1");
      expect(marks.get(15)).toBe(0);
      expect(marks.get(16)).toBe(0);
      expect(marks.get(17)).toBe(0);
      expect(marks.get(18)).toBe(0);
      expect(marks.get(19)).toBe(0);
      expect(marks.get(20)).toBe(0);
      expect(marks.get(25)).toBe(0);
    });

    test("initializes with 0 points for all players", () => {
      const game = new CricketGame(players, defaultConfig);
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.getPlayerScore("p2")).toBe(0);
    });

    test("starts with first player", () => {
      const game = new CricketGame(players, defaultConfig);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new CricketGame(players, defaultConfig);
      expect(game.isFinished()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });

    test("cricket numbers are 15-20 and Bull (25)", () => {
      const game = new CricketGame(players, defaultConfig);
      expect(game.getCricketNumbers()).toEqual([15, 16, 17, 18, 19, 20, 25]);
    });
  });

  describe("recording marks", () => {
    let game: CricketGame;

    beforeEach(() => {
      game = new CricketGame(players, defaultConfig);
    });

    test("single hit adds 1 mark", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerMarks("p1").get(20)).toBe(1);
    });

    test("double hit adds 2 marks", () => {
      game.recordThrow({ segment: 20, multiplier: 2 });
      expect(game.getPlayerMarks("p1").get(20)).toBe(2);
    });

    test("triple hit adds 3 marks (closes number)", () => {
      game.recordThrow({ segment: 20, multiplier: 3 });
      expect(game.getPlayerMarks("p1").get(20)).toBe(3);
    });

    test("non-cricket numbers are ignored (no marks)", () => {
      game.recordThrow({ segment: 10, multiplier: 1 });
      // Should not affect any cricket number
      const marks = game.getPlayerMarks("p1");
      for (const num of game.getCricketNumbers()) {
        expect(marks.get(num)).toBe(0);
      }
    });

    test("miss adds no marks", () => {
      game.recordThrow({ segment: 0, multiplier: 1 });
      const marks = game.getPlayerMarks("p1");
      for (const num of game.getCricketNumbers()) {
        expect(marks.get(num)).toBe(0);
      }
    });

    test("bull (25) single adds 1 mark to bull", () => {
      game.recordThrow({ segment: 25, multiplier: 1 });
      expect(game.getPlayerMarks("p1").get(25)).toBe(1);
    });

    test("bull (50) double adds 2 marks to bull", () => {
      game.recordThrow({ segment: 50, multiplier: 1 });
      expect(game.getPlayerMarks("p1").get(25)).toBe(2);
    });

    test("switches player after 3 darts", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 19, multiplier: 1 });
      game.recordThrow({ segment: 18, multiplier: 1 });
      expect(game.getCurrentPlayer().id).toBe("p2");
    });
  });

  describe("scoring points", () => {
    let game: CricketGame;

    beforeEach(() => {
      game = new CricketGame(players, defaultConfig);
    });

    test("no points when number not closed by thrower", () => {
      game.recordThrow({ segment: 20, multiplier: 1 }); // 1 mark only
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("excess marks score points when opponent hasn't closed", () => {
      // P1 hits T20 (3 marks, closes 20) then next visit...
      game.recordThrow({ segment: 20, multiplier: 3 }); // 3 marks = closed
      game.recordThrow({ segment: 0, multiplier: 1 }); // miss
      game.recordThrow({ segment: 0, multiplier: 1 }); // miss - end visit
      // P2 turn - skip
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P1 again - hits 20 (already closed, opponent not closed)
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(20);
    });

    test("marks beyond 3 on same throw score points", () => {
      // P1: 2 marks on 20 first
      game.recordThrow({ segment: 20, multiplier: 1 }); // 1 mark
      game.recordThrow({ segment: 20, multiplier: 1 }); // 2 marks
      // Now T20 adds 3 marks: 2 go to close, 2 overflow = 40 points
      game.recordThrow({ segment: 20, multiplier: 3 }); // 2+3=5 marks, 2 extra
      expect(game.getPlayerScore("p1")).toBe(40);
    });

    test("no points when opponent has also closed the number", () => {
      // P1 closes 20
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2 closes 20
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P1 hits 20 again - both closed, no points
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("bull scores 25 points per extra mark", () => {
      // P1 closes bull (3 marks)
      game.recordThrow({ segment: 25, multiplier: 1 }); // 1 mark
      game.recordThrow({ segment: 50, multiplier: 1 }); // 2 marks (bull = 2)
      game.recordThrow({ segment: 0, multiplier: 1 }); // miss
      // P2 skip
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P1 hits 25 - already closed, opponent not closed
      game.recordThrow({ segment: 25, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(25);
    });
  });

  describe("game completion", () => {
    let game: CricketGame;

    beforeEach(() => {
      game = new CricketGame(players, defaultConfig);
    });

    test("game ends when a player closes all numbers and has equal or more points", () => {
      // Helper to skip P2 turn
      const skipP2 = (): void => {
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      };

      // P1 visit 1: close 15, 16, 17
      game.recordThrow({ segment: 15, multiplier: 3 });
      game.recordThrow({ segment: 16, multiplier: 3 });
      game.recordThrow({ segment: 17, multiplier: 3 });
      skipP2();
      // P1 visit 2: close 18, 19, 20
      game.recordThrow({ segment: 18, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      skipP2();
      // P1 visit 3: close bull (25+50 = 3 marks)
      game.recordThrow({ segment: 25, multiplier: 1 });
      game.recordThrow({ segment: 50, multiplier: 1 }); // 2 marks for bull = 3 total

      // P1 has closed all numbers with >= P2's points (both 0)
      expect(game.isFinished()).toBe(true);
      expect(game.getWinner()?.id).toBe("p1");
    });

    test("game not finished if player closes all but has fewer points", () => {
      const skipP2 = (): void => {
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      };

      // P1: close 20
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2: close 20 and 19, then score on 19
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 }); // closes 19
      game.recordThrow({ segment: 19, multiplier: 3 }); // scores 57 pts
      // P1 closes 19, 18, 17
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 18, multiplier: 3 });
      game.recordThrow({ segment: 17, multiplier: 3 });
      skipP2();
      // P1 closes 16, 15, bull(25)
      game.recordThrow({ segment: 16, multiplier: 3 });
      game.recordThrow({ segment: 15, multiplier: 3 });
      game.recordThrow({ segment: 25, multiplier: 1 }); // 1 mark on bull
      skipP2();
      // P1 closes bull (need 2 more marks)
      game.recordThrow({ segment: 50, multiplier: 1 }); // 2 marks = 3 total on bull
      // P1 has all closed but 0 points < P2's 57 points
      expect(game.isFinished()).toBe(false);
    });
  });

  describe("undo", () => {
    let game: CricketGame;

    beforeEach(() => {
      game = new CricketGame(players, defaultConfig);
    });

    test("undo removes mark from number", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.undoLastThrow();
      expect(game.getPlayerMarks("p1").get(20)).toBe(0);
    });

    test("undo removes scored points", () => {
      // Close 20 for P1
      game.recordThrow({ segment: 20, multiplier: 3 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2 skip
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P1 scores on 20
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(20);
      game.undoLastThrow();
      expect(game.getPlayerScore("p1")).toBe(0);
    });

    test("undo returns false when nothing to undo", () => {
      expect(game.undoLastThrow()).toBe(false);
    });

    test("undo returns true on success", () => {
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.undoLastThrow()).toBe(true);
    });

    test("undo clears finished state", () => {
      const skipP2 = (): void => {
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      };
      // P1 visit 1: close 15, 16, 17
      game.recordThrow({ segment: 15, multiplier: 3 });
      game.recordThrow({ segment: 16, multiplier: 3 });
      game.recordThrow({ segment: 17, multiplier: 3 });
      skipP2();
      // P1 visit 2: close 18, 19, 20
      game.recordThrow({ segment: 18, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      skipP2();
      // P1 visit 3: close bull
      game.recordThrow({ segment: 25, multiplier: 1 });
      game.recordThrow({ segment: 50, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
      game.undoLastThrow();
      expect(game.isFinished()).toBe(false);
    });
  });

  describe("multi-leg", () => {
    test("winning a leg does not finish match if more legs needed", () => {
      const game = new CricketGame(players, { ...defaultConfig, legs: 3 });
      const skipP2 = (): void => {
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      };
      game.recordThrow({ segment: 15, multiplier: 3 });
      game.recordThrow({ segment: 16, multiplier: 3 });
      game.recordThrow({ segment: 17, multiplier: 3 });
      skipP2();
      game.recordThrow({ segment: 18, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      skipP2();
      game.recordThrow({ segment: 25, multiplier: 1 });
      game.recordThrow({ segment: 50, multiplier: 1 });
      expect(game.isLegFinished()).toBe(true);
      expect(game.isFinished()).toBe(false);
    });

    test("nextLeg resets marks and scores", () => {
      const game = new CricketGame(players, { ...defaultConfig, legs: 3 });
      const skipP2 = (): void => {
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
        game.recordThrow({ segment: 0, multiplier: 1 });
      };
      game.recordThrow({ segment: 15, multiplier: 3 });
      game.recordThrow({ segment: 16, multiplier: 3 });
      game.recordThrow({ segment: 17, multiplier: 3 });
      skipP2();
      game.recordThrow({ segment: 18, multiplier: 3 });
      game.recordThrow({ segment: 19, multiplier: 3 });
      game.recordThrow({ segment: 20, multiplier: 3 });
      skipP2();
      game.recordThrow({ segment: 25, multiplier: 1 });
      game.recordThrow({ segment: 50, multiplier: 1 });
      game.nextLeg();
      expect(game.getPlayerMarks("p1").get(20)).toBe(0);
      expect(game.getPlayerScore("p1")).toBe(0);
      expect(game.isLegFinished()).toBe(false);
    });
  });
});
