import { describe, expect, test } from "bun:test";
import { getPresetDescription } from "../presetFormatting";
import type { PlayerPreset, GamePreset } from "../../../types";

describe("getPresetDescription", () => {
  test("formats player preset with 1 player (singular)", () => {
    const preset: PlayerPreset = {
      id: "1",
      name: "Solo",
      playerNames: ["Alice"],
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("1 player");
  });

  test("formats player preset with multiple players (plural)", () => {
    const preset: PlayerPreset = {
      id: "2",
      name: "Group",
      playerNames: ["Alice", "Bob", "Charlie"],
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("3 players");
  });

  test("formats game preset with variant and out rule", () => {
    const preset: GamePreset = {
      id: "3",
      name: "Game",
      playerNames: ["Alice", "Bob"],
      gameType: "x01",
      gameConfig: { variant: 501, outRule: "double" },
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("2 players - 501 double out");
  });

  test("formats game preset without variant using game name", () => {
    const preset: GamePreset = {
      id: "4",
      name: "Custom Game",
      playerNames: ["Alice"],
      gameType: "cricket",
      gameConfig: {},
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("1 player - CRICKET");
  });

  test("formats game preset with missing gameType gracefully", () => {
    const preset: GamePreset = {
      id: "5",
      name: "Legacy",
      playerNames: ["Alice", "Bob"],
      gameType: undefined as unknown as string,
      gameConfig: {},
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("2 players - Game");
  });

  test("formats game preset with variant but no outRule", () => {
    const preset: GamePreset = {
      id: "6",
      name: "No Out Rule",
      playerNames: ["Alice"],
      gameType: "x01",
      gameConfig: { variant: 301 },
      createdAt: 1000,
    };
    expect(getPresetDescription(preset)).toBe("1 player - 301  out");
  });
});
