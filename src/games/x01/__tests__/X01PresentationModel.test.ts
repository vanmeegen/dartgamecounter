import { describe, expect, test } from "bun:test";
import { X01Game } from "../X01Game";
import {
  getLegWinner,
  computeCurrentGameStats,
  getAllTimeStats,
  formatAverage,
  formatNumber,
} from "../X01PresentationModel";
import type { Player } from "../../../types";
import type { X01Config } from "../types";

const players: Player[] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
];

const config301Single: X01Config = {
  variant: 301,
  outRule: "single",
  legs: 1,
};

describe("getLegWinner", () => {
  test("returns null when no player has score 0", () => {
    const game = new X01Game(players, config301Single);
    expect(getLegWinner(game)).toBeNull();
  });

  test("returns the winning player when score is 0", () => {
    const game = new X01Game(players, config301Single);
    game.state.players[0].score = 0;
    const winner = getLegWinner(game);
    expect(winner).not.toBeNull();
    expect(winner?.id).toBe("p1");
    expect(winner?.name).toBe("Alice");
  });

  test("returns null when playerId with score 0 doesnt match any player", () => {
    const game = new X01Game(players, config301Single);
    // Manually set a non-existent player id
    game.state.players[0].playerId = "nonexistent";
    game.state.players[0].score = 0;
    const winner = getLegWinner(game);
    expect(winner).toBeNull();
  });
});

describe("computeCurrentGameStats", () => {
  test("computes stats for all players", () => {
    const game = new X01Game(players, config301Single);
    // P1 throws some darts
    game.recordThrow({ segment: 20, multiplier: 3 });
    game.recordThrow({ segment: 20, multiplier: 3 });
    game.recordThrow({ segment: 20, multiplier: 3 });

    const stats = computeCurrentGameStats(game);
    expect(stats.size).toBe(2);
    expect(stats.has("Alice")).toBe(true);
    expect(stats.has("Bob")).toBe(true);
  });
});

describe("getAllTimeStats", () => {
  test("retrieves stats for all players", () => {
    const game = new X01Game(players, config301Single);
    const mockGetStats = (
      _gameType: string,
      playerName: string
    ): { gamesPlayed: number; gamesWon: number } | null => {
      if (playerName === "Alice") {
        return { gamesPlayed: 5, gamesWon: 3 };
      }
      return null;
    };

    const stats = getAllTimeStats(game, mockGetStats);
    expect(stats.size).toBe(2);
    expect(stats.get("Alice")).toEqual({ gamesPlayed: 5, gamesWon: 3 });
    expect(stats.get("Bob")).toBeNull();
  });
});

describe("formatAverage", () => {
  test("returns dash for zero", () => {
    expect(formatAverage(0)).toBe("-");
  });

  test("returns integer for whole numbers", () => {
    expect(formatAverage(60)).toBe("60");
    expect(formatAverage(180)).toBe("180");
  });

  test("returns one decimal for fractional numbers", () => {
    expect(formatAverage(60.5)).toBe("60.5");
    expect(formatAverage(99.9)).toBe("99.9");
  });
});

describe("formatNumber", () => {
  test("formats integer with no decimals", () => {
    expect(formatNumber(42)).toBe("42");
  });

  test("formats number with specified decimals using comma", () => {
    expect(formatNumber(42.567, 2)).toBe("42,57");
    expect(formatNumber(100.1, 1)).toBe("100,1");
  });

  test("formats zero correctly", () => {
    expect(formatNumber(0, 2)).toBe("0,00");
  });
});
