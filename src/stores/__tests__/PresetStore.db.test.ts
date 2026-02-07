/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-non-null-assertion */
/**
 * Tests for PresetStore with mocked IndexedDB.
 * These tests cover the DB-dependent code paths by injecting a mock db object.
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { PresetStore } from "../PresetStore";

interface MockValue {
  id?: string;
  name?: string;
  key?: string;
}

interface MockHandlers {
  getAll: (storeName: string) => Promise<unknown[]>;
  put: (storeName: string, value: MockValue) => Promise<string>;
  delete: (storeName: string, key: string) => Promise<void>;
}

function createMockDB() {
  const stores: Record<string, Map<string, unknown>> = {
    presets: new Map(),
    rememberedPlayers: new Map(),
    playerStatistics: new Map(),
  };

  const handlers: MockHandlers = {
    getAll(storeName: string) {
      return Promise.resolve(Array.from(stores[storeName]?.values() ?? []));
    },
    put(storeName: string, value: MockValue) {
      const key = value.id ?? value.name ?? value.key ?? "";
      stores[storeName]?.set(key, value);
      return Promise.resolve(key);
    },
    delete(storeName: string, key: string) {
      stores[storeName]?.delete(key);
      return Promise.resolve();
    },
  };

  const mock = {
    getAll: (...args: Parameters<MockHandlers["getAll"]>) => handlers.getAll(...args),
    put: (...args: Parameters<MockHandlers["put"]>) => handlers.put(...args),
    delete: (...args: Parameters<MockHandlers["delete"]>) => handlers.delete(...args),
  };

  return { mock, handlers, stores };
}

function injectMockDB(store: PresetStore) {
  const { mock, handlers, stores } = createMockDB();
  (store as unknown as { db: unknown }).db = mock;
  return { handlers, stores };
}

describe("PresetStore - with mock DB", () => {
  let store: PresetStore;
  let handlers: MockHandlers;

  beforeEach(() => {
    store = new PresetStore();
    const injected = injectMockDB(store);
    handlers = injected.handlers;
  });

  describe("savePlayerPreset", () => {
    test("saves a player preset and adds to presets array", async () => {
      const preset = await store.savePlayerPreset("Test Preset", ["Alice", "Bob"]);
      expect(preset).not.toBeNull();
      expect(preset?.name).toBe("Test Preset");
      expect(preset?.playerNames).toEqual(["Alice", "Bob"]);
      expect(store.presets).toHaveLength(1);
    });

    test("returns null when playerNames is empty", async () => {
      const result = await store.savePlayerPreset("Test", []);
      expect(result).toBeNull();
      expect(store.presets).toHaveLength(0);
    });

    test("handles db error gracefully", async () => {
      handlers.put = () => Promise.reject(new Error("DB error"));
      const result = await store.savePlayerPreset("Test", ["Alice"]);
      expect(result).toBeNull();
    });
  });

  describe("saveGamePreset", () => {
    test("saves a game preset", async () => {
      const preset = await store.saveGamePreset("Game Preset", ["Alice", "Bob"], "x01", {
        variant: 501,
        outRule: "double",
      });
      expect(preset).not.toBeNull();
      expect(preset?.name).toBe("Game Preset");
      expect(preset?.gameType).toBe("x01");
      expect(store.presets).toHaveLength(1);
    });

    test("returns null when playerNames is empty", async () => {
      const result = await store.saveGamePreset("Test", [], "x01", {});
      expect(result).toBeNull();
    });

    test("handles db error gracefully", async () => {
      handlers.put = () => Promise.reject(new Error("DB error"));
      const result = await store.saveGamePreset("Test", ["Alice"], "x01", {});
      expect(result).toBeNull();
    });
  });

  describe("deletePreset", () => {
    test("deletes a preset and removes from array", async () => {
      const preset = await store.savePlayerPreset("To Delete", ["Alice"]);
      expect(store.presets).toHaveLength(1);

      const result = await store.deletePreset(preset!.id);
      expect(result).toBe(true);
      expect(store.presets).toHaveLength(0);
    });

    test("handles db error gracefully", async () => {
      handlers.delete = () => Promise.reject(new Error("DB error"));
      const result = await store.deletePreset("some-id");
      expect(result).toBe(false);
    });
  });

  describe("rememberPlayer", () => {
    test("adds a player name to remembered list", async () => {
      const result = await store.rememberPlayer("Alice");
      expect(result).toBe(true);
      expect(store.rememberedPlayers).toContain("Alice");
    });

    test("returns false for empty trimmed name", async () => {
      const result = await store.rememberPlayer("   ");
      expect(result).toBe(false);
    });

    test("returns false for already remembered player", async () => {
      await store.rememberPlayer("Alice");
      const result = await store.rememberPlayer("Alice");
      expect(result).toBe(false);
    });

    test("trims the name", async () => {
      await store.rememberPlayer("  Alice  ");
      expect(store.rememberedPlayers).toContain("Alice");
    });

    test("sorts remembered players", async () => {
      await store.rememberPlayer("Charlie");
      await store.rememberPlayer("Alice");
      await store.rememberPlayer("Bob");
      expect(store.rememberedPlayers).toEqual(["Alice", "Bob", "Charlie"]);
    });

    test("handles db error gracefully", async () => {
      handlers.put = () => Promise.reject(new Error("DB error"));
      const result = await store.rememberPlayer("Alice");
      expect(result).toBe(false);
    });
  });

  describe("rememberPlayers", () => {
    test("remembers multiple players", async () => {
      await store.rememberPlayers(["Alice", "Bob", "Charlie"]);
      expect(store.rememberedPlayers).toHaveLength(3);
    });
  });

  describe("updateRememberedPlayer", () => {
    test("updates a remembered player name", async () => {
      await store.rememberPlayer("Alice");
      const result = await store.updateRememberedPlayer("Alice", "Alicia");
      expect(result).toBe(true);
      expect(store.rememberedPlayers).toContain("Alicia");
      expect(store.rememberedPlayers).not.toContain("Alice");
    });

    test("returns false for empty new name", async () => {
      await store.rememberPlayer("Alice");
      const result = await store.updateRememberedPlayer("Alice", "  ");
      expect(result).toBe(false);
    });

    test("returns false when new name already exists (different from old)", async () => {
      await store.rememberPlayer("Alice");
      await store.rememberPlayer("Bob");
      const result = await store.updateRememberedPlayer("Alice", "Bob");
      expect(result).toBe(false);
    });

    test("allows updating to the same name (trimmed)", async () => {
      await store.rememberPlayer("Alice");
      const result = await store.updateRememberedPlayer("Alice", "Alice");
      expect(result).toBe(true);
    });

    test("handles db error gracefully", async () => {
      await store.rememberPlayer("Alice");
      handlers.delete = () => Promise.reject(new Error("DB error"));
      const result = await store.updateRememberedPlayer("Alice", "Alicia");
      expect(result).toBe(false);
    });
  });

  describe("forgetPlayer", () => {
    test("removes a player from remembered list", async () => {
      await store.rememberPlayer("Alice");
      expect(store.rememberedPlayers).toHaveLength(1);

      const result = await store.forgetPlayer("Alice");
      expect(result).toBe(true);
      expect(store.rememberedPlayers).toHaveLength(0);
    });

    test("handles db error gracefully", async () => {
      handlers.delete = () => Promise.reject(new Error("DB error"));
      const result = await store.forgetPlayer("Alice");
      expect(result).toBe(false);
    });
  });
});
