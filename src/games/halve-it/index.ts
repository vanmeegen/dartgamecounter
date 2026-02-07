/**
 * Halve It Game Module - registration and exports
 */

import { gameRegistry } from "../registry";
import { HalveItGame } from "./HalveItGame";
import { HalveItConfigView } from "./HalveItConfigView";
import { HalveItPlayView } from "./HalveItPlayView";
import type { HalveItConfig } from "./types";
import { DEFAULT_HALVE_IT_TARGETS } from "./types";

gameRegistry.register<HalveItConfig>({
  id: "halve-it",
  name: "Halve It",
  description: "Hit round targets or get your score halved",
  minPlayers: 1,
  maxPlayers: 8,
  defaultConfig: {
    targets: DEFAULT_HALVE_IT_TARGETS,
    startingScore: 40,
    legs: 1,
  },
  ConfigComponent: HalveItConfigView,
  PlayComponent: HalveItPlayView,
  createGame: (players, config) => new HalveItGame(players, config),
});

export { HalveItGame } from "./HalveItGame";
export { HalveItConfigView } from "./HalveItConfigView";
export { HalveItPlayView } from "./HalveItPlayView";
export type { HalveItConfig, HalveItTarget } from "./types";
