/**
 * Tests for PlayerSetupStore reactivity
 * These tests verify that MobX observable changes are tracked correctly
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { autorun } from "mobx";
import { PlayerSetupStore } from "../PlayerSetupStore";

describe("PlayerSetupStore reactivity", () => {
  let store: PlayerSetupStore;

  beforeEach(() => {
    store = new PlayerSetupStore();
  });

  describe("Bug 1: Adding players should trigger reactivity", () => {
    test("adding multiple players updates the players array correctly", () => {
      // Track how many times the players array changes
      const snapshots: string[][] = [];

      // Set up MobX autorun to track changes
      const dispose = autorun(() => {
        // Access players to track it
        snapshots.push(store.players.map((p) => p.name));
      });

      // Initial state - empty array
      expect(snapshots.length).toBe(1);
      expect(snapshots[0]).toEqual([]);

      // Add first player
      store.addPlayer("Alice");
      expect(snapshots.length).toBe(2);
      expect(snapshots[1]).toEqual(["Alice"]);

      // Add second player - THIS IS THE BUG: should trigger another update
      store.addPlayer("Bob");
      expect(snapshots.length).toBe(3);
      expect(snapshots[2]).toEqual(["Alice", "Bob"]);

      // Add third player
      store.addPlayer("Charlie");
      expect(snapshots.length).toBe(4);
      expect(snapshots[3]).toEqual(["Alice", "Bob", "Charlie"]);

      dispose();
    });

    test("players array reference should be observable", () => {
      let changeCount = 0;

      const dispose = autorun(() => {
        // Access length to track array changes (void to suppress unused warning)
        void store.players.length;
        changeCount++;
      });

      expect(changeCount).toBe(1); // Initial run

      store.addPlayer("Alice");
      expect(changeCount).toBe(2);

      store.addPlayer("Bob");
      expect(changeCount).toBe(3);

      dispose();
    });
  });

  describe("Bug 2: Reordering players should trigger reactivity", () => {
    test("reordering players updates the array order correctly", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.addPlayer("Charlie");

      const snapshots: string[][] = [];
      const dispose = autorun(() => {
        snapshots.push(store.players.map((p) => p.name));
      });

      // Initial state after adding players
      expect(snapshots[0]).toEqual(["Alice", "Bob", "Charlie"]);

      // Reorder: move Alice (index 0) to end (index 2)
      store.reorderPlayers(0, 2);

      // Should trigger a new snapshot with updated order
      expect(snapshots.length).toBe(2);
      expect(snapshots[1]).toEqual(["Bob", "Charlie", "Alice"]);

      dispose();
    });

    test("reorderPlayers should create correct order", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.addPlayer("Charlie");

      // Move first to last
      store.reorderPlayers(0, 2);

      const names = store.players.map((p) => p.name);
      expect(names).toEqual(["Bob", "Charlie", "Alice"]);
    });

    test("reorderPlayers should work with adjacent items", () => {
      store.addPlayer("Alice");
      store.addPlayer("Bob");
      store.addPlayer("Charlie");

      // Swap first two
      store.reorderPlayers(0, 1);

      const names = store.players.map((p) => p.name);
      expect(names).toEqual(["Bob", "Alice", "Charlie"]);
    });
  });
});
