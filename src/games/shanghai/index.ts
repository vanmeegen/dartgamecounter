/**
 * Shanghai Game Module - registration and exports
 */

import { gameRegistry } from "../registry";
import { ShanghaiGame } from "./ShanghaiGame";
import { ShanghaiConfigView } from "./ShanghaiConfigView";
import { ShanghaiPlayView } from "./ShanghaiPlayView";
import type { ShanghaiConfig } from "./types";

gameRegistry.register<ShanghaiConfig>({
  id: "shanghai",
  name: "Shanghai",
  description: "Target each number in turn; hit single+double+triple to win instantly",
  minPlayers: 2,
  maxPlayers: 8,
  defaultConfig: { rounds: 7, startNumber: 1, legs: 1 },
  ConfigComponent: ShanghaiConfigView,
  PlayComponent: ShanghaiPlayView,
  createGame: (players, config) => new ShanghaiGame(players, config),
});

export { ShanghaiGame } from "./ShanghaiGame";
export { ShanghaiConfigView } from "./ShanghaiConfigView";
export { ShanghaiPlayView } from "./ShanghaiPlayView";
export type { ShanghaiConfig } from "./types";
