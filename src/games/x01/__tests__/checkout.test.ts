/**
 * Tests for checkout calculator utility
 */

import { describe, it, expect } from "bun:test";
import { calculateCheckout, getCheckoutSuggestion, COMMON_CHECKOUTS } from "../checkout";

describe("calculateCheckout", () => {
  describe("double out", () => {
    it("returns null for impossible scores", () => {
      expect(calculateCheckout(171, 3, "double")).toBeNull();
      expect(calculateCheckout(1, 3, "double")).toBeNull(); // Can't finish on 1 with double out
      expect(calculateCheckout(0, 3, "double")).toBeNull();
    });

    it("finds 1-dart finishes on doubles", () => {
      const d20 = calculateCheckout(40, 1, "double");
      expect(d20).not.toBeNull();
      expect(d20?.description).toBe("D20");

      const bull = calculateCheckout(50, 1, "double");
      expect(bull).not.toBeNull();
      expect(bull?.description).toBe("Bull");

      const d1 = calculateCheckout(2, 1, "double");
      expect(d1).not.toBeNull();
      expect(d1?.description).toBe("D1");
    });

    it("returns null when not enough darts for finish", () => {
      // 100 requires 2 darts minimum (T20 D20)
      expect(calculateCheckout(100, 1, "double")).toBeNull();
      // 170 requires 3 darts
      expect(calculateCheckout(170, 2, "double")).toBeNull();
    });

    it("finds 2-dart finishes", () => {
      // 100 = T20 D20
      const result100 = calculateCheckout(100, 2, "double");
      expect(result100).not.toBeNull();
      expect(result100?.darts).toHaveLength(2);

      // 80 = T20 D10
      const result80 = calculateCheckout(80, 2, "double");
      expect(result80).not.toBeNull();
      expect(result80?.darts).toHaveLength(2);
    });

    it("returns null for impossible 3-dart checkouts (bogey numbers)", () => {
      // 169, 168, 166, 165, 163, 162 are impossible with double out
      expect(calculateCheckout(169, 3, "double")).toBeNull();
      expect(calculateCheckout(168, 3, "double")).toBeNull();
      expect(calculateCheckout(166, 3, "double")).toBeNull();
      expect(calculateCheckout(165, 3, "double")).toBeNull();
      expect(calculateCheckout(163, 3, "double")).toBeNull();
      expect(calculateCheckout(162, 3, "double")).toBeNull();
    });

    it("finds 3-dart finishes", () => {
      // 170 = T20 T20 Bull (max checkout)
      const result170 = calculateCheckout(170, 3, "double");
      expect(result170).not.toBeNull();
      expect(result170?.darts).toHaveLength(3);

      // 141 = T20 T19 D12
      const result141 = calculateCheckout(141, 3, "double");
      expect(result141).not.toBeNull();
      expect(result141?.darts).toHaveLength(3);
    });

    it("returns null for 0 darts remaining", () => {
      expect(calculateCheckout(40, 0, "double")).toBeNull();
    });
  });

  describe("single out", () => {
    it("finds 1-dart finishes on any segment", () => {
      // Single 1
      const s1 = calculateCheckout(1, 1, "single");
      expect(s1).not.toBeNull();
      expect(s1?.description).toBe("1");

      // Triple 20
      const t20 = calculateCheckout(60, 1, "single");
      expect(t20).not.toBeNull();
      expect(t20?.description).toBe("T20");

      // Double 20
      const d20 = calculateCheckout(40, 1, "single");
      expect(d20).not.toBeNull();
    });

    it("handles scores that require specific segments", () => {
      // 25 = Single bull
      const sb = calculateCheckout(25, 1, "single");
      expect(sb).not.toBeNull();
      expect(sb?.description).toBe("25");
    });
  });
});

describe("COMMON_CHECKOUTS table", () => {
  it("has all checkouts from 2 to 170", () => {
    for (let score = 2; score <= 170; score++) {
      // Not all scores have checkouts (e.g., 169, 168, 166, 165, 163, 162, 159)
      const checkout = COMMON_CHECKOUTS[score];
      if (checkout) {
        expect(typeof checkout).toBe("string");
        expect(checkout.length).toBeGreaterThan(0);
      }
    }
  });

  it("has correct max checkout of 170", () => {
    expect(COMMON_CHECKOUTS[170]).toBe("T20 T20 Bull");
  });

  it("has correct 2-dart checkouts", () => {
    expect(COMMON_CHECKOUTS[100]).toBe("T20 D20");
    expect(COMMON_CHECKOUTS[40]).toBe("D20");
    expect(COMMON_CHECKOUTS[50]).toBe("Bull");
  });

  it("has no checkout for impossible scores", () => {
    expect(COMMON_CHECKOUTS[169]).toBeUndefined();
    expect(COMMON_CHECKOUTS[168]).toBeUndefined();
    expect(COMMON_CHECKOUTS[166]).toBeUndefined();
  });
});

describe("getCheckoutSuggestion", () => {
  it("prefers common checkouts table for double out", () => {
    const result = getCheckoutSuggestion(170, 3, "double");
    expect(result).not.toBeNull();
    expect(result?.description).toBe("T20 T20 Bull");
    expect(result?.darts).toHaveLength(0); // Table lookups don't populate darts
  });

  it("falls back to calculation for single out", () => {
    const result = getCheckoutSuggestion(100, 3, "single");
    expect(result).not.toBeNull();
    // Single out can finish differently than double out
  });

  it("returns null for impossible scores", () => {
    expect(getCheckoutSuggestion(171, 3, "double")).toBeNull();
    expect(getCheckoutSuggestion(1, 3, "double")).toBeNull();
  });

  it("respects darts remaining parameter", () => {
    // 170 needs 3 darts
    expect(getCheckoutSuggestion(170, 2, "double")).toBeNull();
    expect(getCheckoutSuggestion(170, 3, "double")).not.toBeNull();
  });
});
