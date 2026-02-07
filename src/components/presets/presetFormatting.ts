/**
 * Preset formatting utilities - presentation logic extracted from PresetList component.
 */

import { isGamePreset, type Preset } from "../../types";

/**
 * Generate a human-readable description for a preset.
 */
export function getPresetDescription(preset: Preset): string {
  const playerCount = preset.playerNames.length;
  const playerText = `${playerCount} player${playerCount !== 1 ? "s" : ""}`;

  if (isGamePreset(preset)) {
    const config = preset.gameConfig;
    const gameName = preset.gameType?.toUpperCase() ?? "Game";
    const details = config.variant ? `${config.variant} ${config.outRule ?? ""} out` : gameName;
    return `${playerText} - ${details}`;
  }
  return playerText;
}
