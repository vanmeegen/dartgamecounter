/**
 * Tests for PresetStore
 * Note: IndexedDB mocking is limited in bun test environment
 * These tests verify the store's observable state management
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { PresetStore } from "../PresetStore";
import { isGamePreset } from "../../types";

describe("PresetStore", () => {
  let store: PresetStore;

  beforeEach(() => {
    store = new PresetStore();
  });

  describe("initialization", () => {
    test("initializes with empty presets array", () => {
      expect(store.presets).toEqual([]);
    });

    // Note: isLoading becomes false quickly since IndexedDB fails in test env
    test("handles IndexedDB unavailability gracefully", () => {
      // Store should work even without IndexedDB
      expect(Array.isArray(store.presets)).toBe(true);
    });
  });

  describe("sortedPresets", () => {
    test("returns presets sorted by creation date (newest first)", () => {
      // Manually add some presets to test sorting
      const preset1 = { id: "1", name: "Old", playerNames: ["A"], createdAt: 1000 };
      const preset2 = { id: "2", name: "New", playerNames: ["B"], createdAt: 2000 };
      store.presets.push(preset1, preset2);

      const sorted = store.sortedPresets;
      expect(sorted[0].name).toBe("New");
      expect(sorted[1].name).toBe("Old");
    });
  });

  describe("randomizedPresets", () => {
    test("returns all presets", () => {
      const preset1 = { id: "1", name: "A", playerNames: ["A"], createdAt: 1000 };
      const preset2 = { id: "2", name: "B", playerNames: ["B"], createdAt: 2000 };
      store.presets.push(preset1, preset2);

      const randomized = store.randomizedPresets;
      expect(randomized).toHaveLength(2);
    });
  });
});

describe("isGamePreset type guard", () => {
  test("returns true for game preset", () => {
    const gamePreset = {
      id: "1",
      name: "Test",
      playerNames: ["A"],
      gameConfig: { variant: 501 as const, outRule: "double" as const, legs: 1 },
      createdAt: 1000,
    };
    expect(isGamePreset(gamePreset)).toBe(true);
  });

  test("returns false for player preset", () => {
    const playerPreset = {
      id: "1",
      name: "Test",
      playerNames: ["A"],
      createdAt: 1000,
    };
    expect(isGamePreset(playerPreset)).toBe(false);
  });
});
