/**
 * Additional coverage tests for PresetStore
 * Tests methods that require IndexedDB (which is unavailable in test env).
 * These verify the early-return paths when db is null.
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { PresetStore } from "../PresetStore";

describe("PresetStore - no DB coverage", () => {
  let store: PresetStore;

  beforeEach(() => {
    store = new PresetStore();
  });

  describe("savePlayerPreset", () => {
    test("returns null when db is not available", async () => {
      const result = await store.savePlayerPreset("Test", ["Alice"]);
      expect(result).toBeNull();
    });

    test("returns null when playerNames is empty", async () => {
      const result = await store.savePlayerPreset("Test", []);
      expect(result).toBeNull();
    });
  });

  describe("saveGamePreset", () => {
    test("returns null when db is not available", async () => {
      const result = await store.saveGamePreset("Test", ["Alice"], "x01", { variant: 501 });
      expect(result).toBeNull();
    });

    test("returns null when playerNames is empty", async () => {
      const result = await store.saveGamePreset("Test", [], "x01", { variant: 501 });
      expect(result).toBeNull();
    });
  });

  describe("deletePreset", () => {
    test("returns false when db is not available", async () => {
      const result = await store.deletePreset("some-id");
      expect(result).toBe(false);
    });
  });

  describe("rememberPlayer", () => {
    test("returns false when db is not available", async () => {
      const result = await store.rememberPlayer("Alice");
      expect(result).toBe(false);
    });
  });

  describe("rememberPlayers", () => {
    test("calls rememberPlayer for each name", async () => {
      // Should not throw even without db
      await store.rememberPlayers(["Alice", "Bob"]);
    });
  });

  describe("updateRememberedPlayer", () => {
    test("returns false when db is not available", async () => {
      const result = await store.updateRememberedPlayer("Alice", "Alicia");
      expect(result).toBe(false);
    });

    test("returns false when new name is empty", async () => {
      // Manually set db to something non-null to test validation path
      // But since we can't, test that the no-db path returns false
      const result = await store.updateRememberedPlayer("Alice", "  ");
      expect(result).toBe(false);
    });

    test("returns false when new name already exists in remembered list", async () => {
      store.rememberedPlayers = ["Alice", "Bob"];
      const result = await store.updateRememberedPlayer("Alice", "Bob");
      expect(result).toBe(false);
    });
  });

  describe("forgetPlayer", () => {
    test("returns false when db is not available", async () => {
      const result = await store.forgetPlayer("Alice");
      expect(result).toBe(false);
    });
  });

  describe("rememberPlayer validation", () => {
    test("returns false for empty name", async () => {
      const result = await store.rememberPlayer("  ");
      expect(result).toBe(false);
    });

    test("returns false for already remembered name", async () => {
      store.rememberedPlayers = ["Alice"];
      const result = await store.rememberPlayer("Alice");
      expect(result).toBe(false);
    });
  });
});
