import { describe, expect, test } from "bun:test";
import { getDartValue, formatDart, isDouble, MISS } from "../dart.types";

describe("dart.types", () => {
  describe("getDartValue", () => {
    test("single numbers return face value", () => {
      expect(getDartValue({ segment: 20, multiplier: 1 })).toBe(20);
      expect(getDartValue({ segment: 1, multiplier: 1 })).toBe(1);
    });

    test("doubles return 2x face value", () => {
      expect(getDartValue({ segment: 20, multiplier: 2 })).toBe(40);
      expect(getDartValue({ segment: 16, multiplier: 2 })).toBe(32);
    });

    test("triples return 3x face value", () => {
      expect(getDartValue({ segment: 20, multiplier: 3 })).toBe(60);
      expect(getDartValue({ segment: 19, multiplier: 3 })).toBe(57);
    });

    test("single bull returns 25", () => {
      expect(getDartValue({ segment: 25, multiplier: 1 })).toBe(25);
    });

    test("double bull returns 50", () => {
      expect(getDartValue({ segment: 50, multiplier: 1 })).toBe(50);
    });

    test("miss returns 0", () => {
      expect(getDartValue(MISS)).toBe(0);
    });
  });

  describe("formatDart", () => {
    test("formats singles without prefix", () => {
      expect(formatDart({ segment: 20, multiplier: 1 })).toBe("20");
      expect(formatDart({ segment: 5, multiplier: 1 })).toBe("5");
    });

    test("formats doubles with D prefix", () => {
      expect(formatDart({ segment: 20, multiplier: 2 })).toBe("D20");
      expect(formatDart({ segment: 16, multiplier: 2 })).toBe("D16");
    });

    test("formats triples with T prefix", () => {
      expect(formatDart({ segment: 20, multiplier: 3 })).toBe("T20");
      expect(formatDart({ segment: 19, multiplier: 3 })).toBe("T19");
    });

    test("formats single bull as 25", () => {
      expect(formatDart({ segment: 25, multiplier: 1 })).toBe("25");
    });

    test("formats double bull as Bull", () => {
      expect(formatDart({ segment: 50, multiplier: 1 })).toBe("Bull");
    });

    test("formats miss as M", () => {
      expect(formatDart(MISS)).toBe("M");
    });
  });

  describe("isDouble", () => {
    test("returns true for double segments", () => {
      expect(isDouble({ segment: 20, multiplier: 2 })).toBe(true);
      expect(isDouble({ segment: 16, multiplier: 2 })).toBe(true);
    });

    test("returns true for double bull (50)", () => {
      expect(isDouble({ segment: 50, multiplier: 1 })).toBe(true);
    });

    test("returns false for singles", () => {
      expect(isDouble({ segment: 20, multiplier: 1 })).toBe(false);
      expect(isDouble({ segment: 25, multiplier: 1 })).toBe(false);
    });

    test("returns false for triples", () => {
      expect(isDouble({ segment: 20, multiplier: 3 })).toBe(false);
    });
  });
});
