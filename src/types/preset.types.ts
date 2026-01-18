/**
 * Preset type definitions for saving/loading game configurations
 */

import type { X01Config } from "./game.types";

/** Player preset - just names */
export interface PlayerPreset {
  id: string;
  name: string;
  playerNames: string[];
  createdAt: number;
}

/** Full game preset - players + game configuration */
export interface GamePreset {
  id: string;
  name: string;
  playerNames: string[];
  gameConfig: X01Config;
  createdAt: number;
}

/** Union type for all presets */
export type Preset = PlayerPreset | GamePreset;

/** Type guard to check if preset includes game config */
export function isGamePreset(preset: Preset): preset is GamePreset {
  return "gameConfig" in preset;
}
