/**
 * Around the Clock Game Module - registration and exports
 */

import { gameRegistry } from "../registry";
import { AroundTheClockGame } from "./AroundTheClockGame";
import { AroundTheClockConfigView } from "./AroundTheClockConfigView";
import { AroundTheClockPlayView } from "./AroundTheClockPlayView";
import type { AroundTheClockConfig } from "./types";

gameRegistry.register<AroundTheClockConfig>({
  id: "around-the-clock",
  name: "Around the Clock",
  description: "Hit 1-20 in sequence, first to finish wins",
  minPlayers: 1,
  maxPlayers: 8,
  defaultConfig: { includesBull: false, doublesAdvanceExtra: false, legs: 1 },
  ConfigComponent: AroundTheClockConfigView,
  PlayComponent: AroundTheClockPlayView,
  createGame: (players, config) => new AroundTheClockGame(players, config),
});

export { AroundTheClockGame } from "./AroundTheClockGame";
export { AroundTheClockConfigView } from "./AroundTheClockConfigView";
export { AroundTheClockPlayView } from "./AroundTheClockPlayView";
export type { AroundTheClockConfig } from "./types";
