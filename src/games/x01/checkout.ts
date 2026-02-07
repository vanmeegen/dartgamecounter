/**
 * Checkout calculator - calculates best finish combinations
 * X01-specific utility.
 */

import type { Dart } from "../../types";
import { formatDart } from "../../types/dart.types";
import type { CheckoutSuggestion, OutRule } from "./types";

// All possible single dart values
const SINGLES: Dart[] = [];
for (let i = 1; i <= 20; i++) {
  SINGLES.push({ segment: i, multiplier: 1 });
}
SINGLES.push({ segment: 25, multiplier: 1 }); // Single bull

// All possible double dart values (valid finishes for double-out)
const DOUBLES: Dart[] = [];
for (let i = 1; i <= 20; i++) {
  DOUBLES.push({ segment: i, multiplier: 2 });
}
DOUBLES.push({ segment: 50, multiplier: 1 }); // Bull (double bull)

// All possible triple dart values
const TRIPLES: Dart[] = [];
for (let i = 1; i <= 20; i++) {
  TRIPLES.push({ segment: i, multiplier: 3 });
}

// All possible darts
const ALL_DARTS: Dart[] = [...SINGLES, ...DOUBLES, ...TRIPLES];

function getDartValue(dart: Dart): number {
  return dart.segment * dart.multiplier;
}

function isValidFinish(dart: Dart, outRule: OutRule): boolean {
  if (outRule === "single") return true;
  // Double out: must be a double (D1-D20) or Bull (50)
  return dart.multiplier === 2 || dart.segment === 50;
}

/**
 * Calculate checkout suggestion for a given score
 */
export function calculateCheckout(
  score: number,
  dartsRemaining: number,
  outRule: OutRule
): CheckoutSuggestion | null {
  if (dartsRemaining <= 0) return null;
  if (score > 170 || score < 1) return null;

  // For single out with score 1, just need single 1
  if (outRule === "single" && score === 1) {
    const dart: Dart = { segment: 1, multiplier: 1 };
    return { darts: [dart], description: formatDart(dart) };
  }

  // For double out, score of 1 is impossible (need at least 2 for D1)
  if (outRule === "double" && score === 1) return null;

  // Try 1-dart finish
  if (dartsRemaining >= 1) {
    const oneDart = findOneDartFinish(score, outRule);
    if (oneDart) return oneDart;
  }

  // Try 2-dart finish
  if (dartsRemaining >= 2) {
    const twoDart = findTwoDartFinish(score, outRule);
    if (twoDart) return twoDart;
  }

  // Try 3-dart finish
  if (dartsRemaining >= 3) {
    const threeDart = findThreeDartFinish(score, outRule);
    if (threeDart) return threeDart;
  }

  return null;
}

function findOneDartFinish(score: number, outRule: OutRule): CheckoutSuggestion | null {
  const finishDarts = outRule === "double" ? DOUBLES : ALL_DARTS;

  for (const dart of finishDarts) {
    if (getDartValue(dart) === score) {
      return {
        darts: [dart],
        description: formatDart(dart),
      };
    }
  }
  return null;
}

function findTwoDartFinish(score: number, outRule: OutRule): CheckoutSuggestion | null {
  const finishDarts = outRule === "double" ? DOUBLES : ALL_DARTS;

  // Try to leave a finish with first dart
  for (const firstDart of ALL_DARTS) {
    const remaining = score - getDartValue(firstDart);
    if (remaining < 2) continue;
    if (outRule === "double" && remaining === 1) continue;

    for (const finishDart of finishDarts) {
      if (getDartValue(finishDart) === remaining && isValidFinish(finishDart, outRule)) {
        return {
          darts: [firstDart, finishDart],
          description: `${formatDart(firstDart)} ${formatDart(finishDart)}`,
        };
      }
    }
  }
  return null;
}

function findThreeDartFinish(score: number, outRule: OutRule): CheckoutSuggestion | null {
  const finishDarts = outRule === "double" ? DOUBLES : ALL_DARTS;

  // Prioritize high-value first darts (T20, T19, etc.)
  const sortedFirstDarts = [...ALL_DARTS].sort((a, b) => getDartValue(b) - getDartValue(a));

  for (const firstDart of sortedFirstDarts) {
    const afterFirst = score - getDartValue(firstDart);
    if (afterFirst < 2) continue;
    if (outRule === "double" && afterFirst === 1) continue;

    for (const secondDart of ALL_DARTS) {
      const afterSecond = afterFirst - getDartValue(secondDart);
      if (afterSecond < 2) continue;
      if (outRule === "double" && afterSecond === 1) continue;

      for (const finishDart of finishDarts) {
        if (getDartValue(finishDart) === afterSecond && isValidFinish(finishDart, outRule)) {
          return {
            darts: [firstDart, secondDart, finishDart],
            description: `${formatDart(firstDart)} ${formatDart(secondDart)} ${formatDart(finishDart)}`,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Pre-computed checkout table for common scores (double out)
 * This provides optimized suggestions for standard checkouts
 */
export const COMMON_CHECKOUTS: Record<number, string> = {
  170: "T20 T20 Bull",
  167: "T20 T19 Bull",
  164: "T20 T18 Bull",
  161: "T20 T17 Bull",
  160: "T20 T20 D20",
  158: "T20 T20 D19",
  157: "T20 T19 D20",
  156: "T20 T20 D18",
  155: "T20 T19 D19",
  154: "T20 T18 D20",
  153: "T20 T19 D18",
  152: "T20 T20 D16",
  151: "T20 T17 D20",
  150: "T20 T18 D18",
  149: "T20 T19 D16",
  148: "T20 T20 D14",
  147: "T20 T17 D18",
  146: "T20 T18 D16",
  145: "T20 T19 D14",
  144: "T20 T20 D12",
  143: "T20 T17 D16",
  142: "T20 T14 D20",
  141: "T20 T19 D12",
  140: "T20 T20 D10",
  139: "T20 T13 D20",
  138: "T20 T18 D12",
  137: "T20 T19 D10",
  136: "T20 T20 D8",
  135: "T20 T17 D12",
  134: "T20 T14 D16",
  133: "T20 T19 D8",
  132: "T20 T16 D12",
  131: "T20 T13 D16",
  130: "T20 T18 D8",
  129: "T19 T16 D12",
  128: "T18 T14 D16",
  127: "T20 T17 D8",
  126: "T19 T19 D6",
  125: "T20 T19 D4",
  124: "T20 T16 D8",
  123: "T19 T16 D9",
  122: "T18 T18 D7",
  121: "T20 T11 D14",
  120: "T20 20 D20",
  119: "T19 T12 D13",
  118: "T20 18 D20",
  117: "T20 17 D20",
  116: "T20 16 D20",
  115: "T20 15 D20",
  114: "T20 14 D20",
  113: "T20 13 D20",
  112: "T20 12 D20",
  111: "T20 11 D20",
  110: "T20 10 D20",
  109: "T20 9 D20",
  108: "T20 16 D16",
  107: "T19 10 D20",
  106: "T20 6 D20",
  105: "T20 5 D20",
  104: "T18 10 D20",
  103: "T19 6 D20",
  102: "T20 10 D16",
  101: "T17 10 D20",
  100: "T20 D20",
  99: "T19 10 D16",
  98: "T20 D19",
  97: "T19 D20",
  96: "T20 D18",
  95: "T19 D19",
  94: "T18 D20",
  93: "T19 D18",
  92: "T20 D16",
  91: "T17 D20",
  90: "T18 D18",
  89: "T19 D16",
  88: "T20 D14",
  87: "T17 D18",
  86: "T18 D16",
  85: "T19 D14",
  84: "T20 D12",
  83: "T17 D16",
  82: "T14 D20",
  81: "T19 D12",
  80: "T20 D10",
  79: "T13 D20",
  78: "T18 D12",
  77: "T19 D10",
  76: "T20 D8",
  75: "T17 D12",
  74: "T14 D16",
  73: "T19 D8",
  72: "T16 D12",
  71: "T13 D16",
  70: "T18 D8",
  69: "T19 D6",
  68: "T20 D4",
  67: "T17 D8",
  66: "T10 D18",
  65: "T19 D4",
  64: "T16 D8",
  63: "T13 D12",
  62: "T10 D16",
  61: "T15 D8",
  60: "20 D20",
  59: "19 D20",
  58: "18 D20",
  57: "17 D20",
  56: "16 D20",
  55: "15 D20",
  54: "14 D20",
  53: "13 D20",
  52: "12 D20",
  51: "11 D20",
  50: "Bull",
  49: "9 D20",
  48: "8 D20",
  47: "7 D20",
  46: "6 D20",
  45: "5 D20",
  44: "4 D20",
  43: "3 D20",
  42: "10 D16",
  41: "9 D16",
  40: "D20",
  39: "7 D16",
  38: "D19",
  37: "5 D16",
  36: "D18",
  35: "3 D16",
  34: "D17",
  33: "1 D16",
  32: "D16",
  31: "7 D12",
  30: "D15",
  29: "5 D12",
  28: "D14",
  27: "3 D12",
  26: "D13",
  25: "9 D8",
  24: "D12",
  23: "7 D8",
  22: "D11",
  21: "5 D8",
  20: "D10",
  19: "3 D8",
  18: "D9",
  17: "1 D8",
  16: "D8",
  15: "7 D4",
  14: "D7",
  13: "5 D4",
  12: "D6",
  11: "3 D4",
  10: "D5",
  9: "1 D4",
  8: "D4",
  7: "3 D2",
  6: "D3",
  5: "1 D2",
  4: "D2",
  3: "1 D1",
  2: "D1",
};

/**
 * Count number of darts needed for a checkout description
 */
function countDartsInCheckout(description: string): number {
  // Split by spaces and count non-empty parts
  return description.split(" ").filter((part) => part.length > 0).length;
}

/**
 * Get checkout suggestion, preferring common checkouts table
 */
export function getCheckoutSuggestion(
  score: number,
  dartsRemaining: number,
  outRule: OutRule
): CheckoutSuggestion | null {
  if (score > 170 || score < 1 || dartsRemaining <= 0) return null;

  // For double out, check common checkouts first
  if (outRule === "double" && COMMON_CHECKOUTS[score]) {
    const description = COMMON_CHECKOUTS[score];
    const dartsNeeded = countDartsInCheckout(description);

    // Only return if we have enough darts remaining
    if (dartsNeeded <= dartsRemaining) {
      return {
        darts: [], // Not needed for display
        description,
      };
    }
  }

  // Fall back to calculated checkout
  return calculateCheckout(score, dartsRemaining, outRule);
}
