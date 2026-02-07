import { describe, expect, test, beforeEach } from "bun:test";
import { HalveItGame } from "../HalveItGame";
import type { Player } from "../../../types";
import type { HalveItConfig, HalveItTarget } from "../types";

describe("HalveItGame", () => {
  const players: Player[] = [
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
  ];

  const simpleTargets: HalveItTarget[] = [
    { type: "number", value: 20, label: "20" },
    { type: "number", value: 19, label: "19" },
    { type: "double", label: "Doubles" },
    { type: "triple", label: "Triples" },
    { type: "bull", label: "Bull" },
  ];

  const defaultConfig: HalveItConfig = {
    targets: simpleTargets,
    startingScore: 40,
    legs: 1,
  };

  describe("initialization", () => {
    test("all players start with the configured starting score", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.getPlayerScore("p1")).toBe(40);
      expect(game.getPlayerScore("p2")).toBe(40);
    });

    test("starts on round 1", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.getCurrentRound()).toBe(1);
    });

    test("starts with first player", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.getCurrentPlayer().id).toBe("p1");
    });

    test("game is not finished initially", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.isFinished()).toBe(false);
    });

    test("first target is the first in the list", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.getCurrentTarget().label).toBe("20");
    });
  });

  describe("scoring - number targets", () => {
    let game: HalveItGame;

    beforeEach(() => {
      game = new HalveItGame(players, defaultConfig);
    });

    test("hitting target number adds points", () => {
      game.recordThrow({ segment: 20, multiplier: 1 }); // single 20 = 20 pts
      expect(game.getPlayerScore("p1")).toBe(60); // 40 + 20
    });

    test("double of target adds double points", () => {
      game.recordThrow({ segment: 20, multiplier: 2 }); // double 20 = 40
      expect(game.getPlayerScore("p1")).toBe(80); // 40 + 40
    });

    test("triple of target adds triple points", () => {
      game.recordThrow({ segment: 20, multiplier: 3 }); // triple 20 = 60
      expect(game.getPlayerScore("p1")).toBe(100); // 40 + 60
    });

    test("hitting wrong number adds nothing", () => {
      game.recordThrow({ segment: 5, multiplier: 1 });
      // Score shouldn't change from the throw itself
      // But if all 3 darts miss the target, score is halved
      // After 1 dart we're still in the visit
      expect(game.getPlayerScore("p1")).toBe(40);
    });

    test("miss adds nothing", () => {
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(40);
    });
  });

  describe("halving penalty", () => {
    test("score is halved when no dart hits the target in a round", () => {
      const game = new HalveItGame(players, defaultConfig);
      // P1 misses all 3 darts at target 20
      game.recordThrow({ segment: 5, multiplier: 1 }); // miss
      game.recordThrow({ segment: 10, multiplier: 1 }); // miss
      game.recordThrow({ segment: 15, multiplier: 1 }); // miss - end of visit
      // Score should be halved: 40 / 2 = 20
      expect(game.getPlayerScore("p1")).toBe(20);
    });

    test("score is NOT halved when at least one dart hits target", () => {
      const game = new HalveItGame(players, defaultConfig);
      // P1: 1 hit + 2 misses at target 20
      game.recordThrow({ segment: 20, multiplier: 1 }); // hit! +20
      game.recordThrow({ segment: 5, multiplier: 1 }); // miss
      game.recordThrow({ segment: 10, multiplier: 1 }); // miss
      // No halving, score = 40 + 20 = 60
      expect(game.getPlayerScore("p1")).toBe(60);
    });

    test("halving rounds down", () => {
      const config: HalveItConfig = { ...defaultConfig, startingScore: 41 };
      const game = new HalveItGame(players, config);
      // P1 misses all
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.recordThrow({ segment: 5, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(20); // floor(41/2)
    });
  });

  describe("double targets", () => {
    test("any double hit scores on double target round", () => {
      const targets: HalveItTarget[] = [{ type: "double", label: "Doubles" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      game.recordThrow({ segment: 10, multiplier: 2 }); // double 10 = 20 pts
      expect(game.getPlayerScore("p1")).toBe(20);
    });

    test("singles don't score on double target round", () => {
      const targets: HalveItTarget[] = [{ type: "double", label: "Doubles" }];
      const config: HalveItConfig = { targets, startingScore: 40, legs: 1 };
      const game = new HalveItGame(players, config);
      game.recordThrow({ segment: 20, multiplier: 1 }); // single, doesn't count
      expect(game.getPlayerScore("p1")).toBe(40); // unchanged
    });
  });

  describe("triple targets", () => {
    test("any triple hit scores on triple target round", () => {
      const targets: HalveItTarget[] = [{ type: "triple", label: "Triples" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      game.recordThrow({ segment: 20, multiplier: 3 }); // triple 20 = 60 pts
      expect(game.getPlayerScore("p1")).toBe(60);
    });
  });

  describe("bull targets", () => {
    test("single bull (25) scores on bull target round", () => {
      const targets: HalveItTarget[] = [{ type: "bull", label: "Bull" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      game.recordThrow({ segment: 25, multiplier: 1 }); // single bull = 25
      expect(game.getPlayerScore("p1")).toBe(25);
    });

    test("double bull (50) scores on bull target round", () => {
      const targets: HalveItTarget[] = [{ type: "bull", label: "Bull" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      game.recordThrow({ segment: 50, multiplier: 1 }); // double bull = 50
      expect(game.getPlayerScore("p1")).toBe(50);
    });
  });

  describe("game completion", () => {
    test("game finishes after all rounds", () => {
      const targets: HalveItTarget[] = [{ type: "number", value: 20, label: "20" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      // P1 round 1
      game.recordThrow({ segment: 20, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2 round 1
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.isFinished()).toBe(true);
    });

    test("highest score wins", () => {
      const targets: HalveItTarget[] = [{ type: "number", value: 20, label: "20" }];
      const config: HalveItConfig = { targets, startingScore: 0, legs: 1 };
      const game = new HalveItGame(players, config);
      // P1: hits 20
      game.recordThrow({ segment: 20, multiplier: 3 }); // +60
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      // P2: misses
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      game.recordThrow({ segment: 0, multiplier: 1 });
      expect(game.getWinner()?.id).toBe("p1");
    });
  });

  describe("undo", () => {
    test("undo removes added points", () => {
      const game = new HalveItGame(players, defaultConfig);
      game.recordThrow({ segment: 20, multiplier: 1 }); // +20
      expect(game.getPlayerScore("p1")).toBe(60);
      game.undoLastThrow();
      expect(game.getPlayerScore("p1")).toBe(40);
    });

    test("returns false when nothing to undo", () => {
      const game = new HalveItGame(players, defaultConfig);
      expect(game.undoLastThrow()).toBe(false);
    });

    test("returns true on success", () => {
      const game = new HalveItGame(players, defaultConfig);
      game.recordThrow({ segment: 20, multiplier: 1 });
      expect(game.undoLastThrow()).toBe(true);
    });

    test("undo of complete round reverts halving penalty", () => {
      const game = new HalveItGame(players, defaultConfig);
      // Miss all 3 -> score halved to 20
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.recordThrow({ segment: 5, multiplier: 1 });
      game.recordThrow({ segment: 5, multiplier: 1 });
      expect(game.getPlayerScore("p1")).toBe(20);
      // Undo back into the visit
      game.undoLastThrow();
      // Score should be restored to 40
      expect(game.getPlayerScore("p1")).toBe(40);
    });
  });
});
