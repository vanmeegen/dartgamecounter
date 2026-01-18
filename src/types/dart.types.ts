/**
 * Dart and throw type definitions
 */

export type Multiplier = 1 | 2 | 3;

export interface Dart {
  /** The base number hit (1-20, 25 for single bull, 50 for double bull) */
  segment: number;
  /** 1 = single, 2 = double, 3 = triple */
  multiplier: Multiplier;
}

/** A visit consists of up to 3 darts */
export interface Visit {
  darts: Dart[];
  /** Total points scored in this visit */
  total: number;
  /** Whether this visit resulted in a bust */
  busted: boolean;
}

/** Represents a missed dart */
export const MISS: Dart = { segment: 0, multiplier: 1 };

/** Calculate the point value of a dart */
export function getDartValue(dart: Dart): number {
  return dart.segment * dart.multiplier;
}

/** Format a dart for display (e.g., "T20", "D16", "Bull", "25", "M") */
export function formatDart(dart: Dart): string {
  if (dart.segment === 0) return "M";
  if (dart.segment === 50) return "Bull";
  if (dart.segment === 25) return "25";
  if (dart.multiplier === 3) return `T${dart.segment}`;
  if (dart.multiplier === 2) return `D${dart.segment}`;
  return `${dart.segment}`;
}

/** Check if a dart is a double (for double-out rules) */
export function isDouble(dart: Dart): boolean {
  return dart.multiplier === 2 || dart.segment === 50;
}
