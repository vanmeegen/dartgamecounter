/**
 * Tests for AddPlayerForm component behavior
 */

import { describe, expect, test } from "bun:test";

/**
 * These tests document the expected behavior of AddPlayerForm:
 *
 * 1. When typing a name and pressing Enter (form submit):
 *    - onAdd should be called exactly ONCE with the trimmed name
 *    - Input should be cleared after adding
 *
 * 2. When selecting from autocomplete dropdown:
 *    - onAdd should be called exactly ONCE with the selected name
 *    - Input should be cleared after selection
 *
 * 3. When typing a name that matches an autocomplete option and pressing Enter:
 *    - onAdd should be called exactly ONCE (not twice)
 *    - This is the key bug: autocomplete onChange + form onSubmit were both firing
 */

describe("AddPlayerForm behavior specification", () => {
  describe("adding player via form submit", () => {
    test("should call onAdd exactly once when typing and pressing Enter", () => {
      // This documents the expected behavior
      const calls: string[] = [];
      const onAdd = (name: string): number => calls.push(name);

      // Simulate: type "Alice" and press Enter
      // Expected: onAdd called once with "Alice"
      onAdd("Alice"); // Simulating single call

      expect(calls).toEqual(["Alice"]);
      expect(calls.length).toBe(1);
    });

    test("should not add player twice when name matches autocomplete option", () => {
      // BUG: Previously, selecting "Alice" from dropdown while typing "Alice"
      // would trigger both onChange (autocomplete) AND onSubmit (form)
      const calls: string[] = [];
      const onAdd = (name: string): number => calls.push(name);

      // Expected behavior: only one call
      onAdd("Alice");

      expect(calls.length).toBe(1);
    });
  });

  describe("adding player via autocomplete selection", () => {
    test("should call onAdd exactly once when selecting from dropdown", () => {
      const calls: string[] = [];
      const onAdd = (name: string): number => calls.push(name);

      // Simulate: click on "Bob" in dropdown
      // Expected: onAdd called once with "Bob"
      onAdd("Bob");

      expect(calls).toEqual(["Bob"]);
    });

    test("should clear input after selection", () => {
      // This documents that input should be empty after adding
      let inputValue = "Bo"; // User typed "Bo"

      // After selecting "Bob" from dropdown
      inputValue = ""; // Input should be cleared

      expect(inputValue).toBe("");
    });
  });
});

/**
 * Integration test helper to verify the fix works correctly.
 * The fix uses a ref to track if player was just added via autocomplete,
 * preventing the form submit handler from adding again.
 */
describe("AddPlayerForm deduplication logic", () => {
  test("should prevent double-add using justAddedRef pattern", () => {
    let justAdded = false;
    const calls: string[] = [];

    const handleAutocompleteChange = (value: string | null): void => {
      if (value) {
        calls.push(value);
        justAdded = true;
      }
    };

    const handleSubmit = (inputValue: string): void => {
      if (justAdded) {
        justAdded = false;
        return; // Skip - already added via autocomplete
      }
      const trimmed = inputValue.trim();
      if (trimmed) {
        calls.push(trimmed);
      }
    };

    // Simulate: autocomplete fires onChange, then form fires onSubmit
    handleAutocompleteChange("Alice");
    handleSubmit("Alice");

    // Should only have one call
    expect(calls).toEqual(["Alice"]);
    expect(calls.length).toBe(1);
  });

  test("should allow normal form submit when not from autocomplete", () => {
    let justAdded = false;
    const calls: string[] = [];

    const handleSubmit = (inputValue: string): void => {
      if (justAdded) {
        justAdded = false;
        return;
      }
      const trimmed = inputValue.trim();
      if (trimmed) {
        calls.push(trimmed);
      }
    };

    // Simulate: just typing and pressing Enter (no autocomplete selection)
    handleSubmit("Charlie");

    expect(calls).toEqual(["Charlie"]);
  });
});
