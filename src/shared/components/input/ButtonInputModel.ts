/**
 * ButtonInputModel - presentation model for ButtonInput component.
 * Encapsulates modifier state management and display logic.
 */

import type { Multiplier } from "../../../types";

export interface ButtonInputState {
  modifier: Multiplier;
}

export function createInitialState(): ButtonInputState {
  return { modifier: 1 };
}

/**
 * Toggle a modifier: if already active, go back to single; otherwise activate.
 */
export function toggleModifier(current: Multiplier, mod: Multiplier): Multiplier {
  return current === mod ? 1 : mod;
}

/**
 * Determine the segment and multiplier for a bull throw based on the active modifier.
 * - No modifier (1): single bull = segment 25, multiplier 1
 * - Double or Triple modifier: double bull = segment 50, multiplier 1
 */
export function getBullThrow(modifier: Multiplier): { segment: number; multiplier: Multiplier } {
  if (modifier === 1) {
    return { segment: 25, multiplier: 1 };
  }
  return { segment: 50, multiplier: 1 };
}

/**
 * Format a button label based on the active modifier.
 */
export function formatButtonLabel(num: number, modifier: Multiplier): string {
  if (modifier === 2) return `D${num}`;
  if (modifier === 3) return `T${num}`;
  return `${num}`;
}

/**
 * Get the bull button text based on the modifier.
 */
export function getBullButtonText(modifier: Multiplier): string {
  return modifier >= 2 ? "Bull" : "25";
}
