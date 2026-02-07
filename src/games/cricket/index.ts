/**
 * Cricket Game Module - registration and exports
 */

import { gameRegistry } from "../registry";
import { CricketGame } from "./CricketGame";
import { CricketConfigView } from "./CricketConfigView";
import { CricketPlayView } from "./CricketPlayView";
import type { CricketConfig } from "./types";

gameRegistry.register<CricketConfig>({
  id: "cricket",
  name: "Cricket",
  description: "Close numbers 15-20 and Bull, score on opponents",
  minPlayers: 2,
  maxPlayers: 8,
  defaultConfig: { marksToClose: 3, legs: 1 },
  ConfigComponent: CricketConfigView,
  PlayComponent: CricketPlayView,
  createGame: (players, config) => new CricketGame(players, config),
});

export { CricketGame } from "./CricketGame";
export { CricketConfigView } from "./CricketConfigView";
export { CricketPlayView } from "./CricketPlayView";
export type { CricketConfig, CricketPlayerState, CricketNumber } from "./types";
