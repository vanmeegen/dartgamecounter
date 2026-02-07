import { describe, expect, test } from "bun:test";
import {
  createInitialState,
  toggleModifier,
  getBullThrow,
  formatButtonLabel,
  getBullButtonText,
} from "../ButtonInputModel";

describe("ButtonInputModel", () => {
  describe("createInitialState", () => {
    test("returns modifier set to 1 (single)", () => {
      const state = createInitialState();
      expect(state.modifier).toBe(1);
    });
  });

  describe("toggleModifier", () => {
    test("activates double when current is single", () => {
      expect(toggleModifier(1, 2)).toBe(2);
    });

    test("activates triple when current is single", () => {
      expect(toggleModifier(1, 3)).toBe(3);
    });

    test("deactivates double when already active", () => {
      expect(toggleModifier(2, 2)).toBe(1);
    });

    test("deactivates triple when already active", () => {
      expect(toggleModifier(3, 3)).toBe(1);
    });

    test("switches from double to triple", () => {
      expect(toggleModifier(2, 3)).toBe(3);
    });

    test("switches from triple to double", () => {
      expect(toggleModifier(3, 2)).toBe(2);
    });
  });

  describe("getBullThrow", () => {
    test("returns single bull (25, 1) when modifier is 1", () => {
      const result = getBullThrow(1);
      expect(result.segment).toBe(25);
      expect(result.multiplier).toBe(1);
    });

    test("returns double bull (50, 1) when modifier is 2", () => {
      const result = getBullThrow(2);
      expect(result.segment).toBe(50);
      expect(result.multiplier).toBe(1);
    });

    test("returns double bull (50, 1) when modifier is 3", () => {
      const result = getBullThrow(3);
      expect(result.segment).toBe(50);
      expect(result.multiplier).toBe(1);
    });
  });

  describe("formatButtonLabel", () => {
    test("returns plain number for single modifier", () => {
      expect(formatButtonLabel(20, 1)).toBe("20");
      expect(formatButtonLabel(1, 1)).toBe("1");
    });

    test("returns D prefix for double modifier", () => {
      expect(formatButtonLabel(20, 2)).toBe("D20");
      expect(formatButtonLabel(5, 2)).toBe("D5");
    });

    test("returns T prefix for triple modifier", () => {
      expect(formatButtonLabel(20, 3)).toBe("T20");
      expect(formatButtonLabel(19, 3)).toBe("T19");
    });
  });

  describe("getBullButtonText", () => {
    test("returns '25' for single modifier", () => {
      expect(getBullButtonText(1)).toBe("25");
    });

    test("returns 'Bull' for double modifier", () => {
      expect(getBullButtonText(2)).toBe("Bull");
    });

    test("returns 'Bull' for triple modifier", () => {
      expect(getBullButtonText(3)).toBe("Bull");
    });
  });
});
