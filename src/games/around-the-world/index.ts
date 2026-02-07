/**
 * Around the World Game Module - registration and exports
 */

import { gameRegistry } from "../registry";
import { AroundTheWorldGame } from "./AroundTheWorldGame";
import { AroundTheWorldConfigView } from "./AroundTheWorldConfigView";
import { AroundTheWorldPlayView } from "./AroundTheWorldPlayView";
import type { AroundTheWorldConfig } from "./types";

gameRegistry.register<AroundTheWorldConfig>({
  id: "around-the-world",
  name: "Around the World",
  description: "Hit 1-20 then Bull; doubles/triples skip ahead",
  minPlayers: 1,
  maxPlayers: 8,
  defaultConfig: { legs: 1 },
  ConfigComponent: AroundTheWorldConfigView,
  PlayComponent: AroundTheWorldPlayView,
  createGame: (players, config) => new AroundTheWorldGame(players, config),
});

export { AroundTheWorldGame } from "./AroundTheWorldGame";
export { AroundTheWorldConfigView } from "./AroundTheWorldConfigView";
export { AroundTheWorldPlayView } from "./AroundTheWorldPlayView";
export type { AroundTheWorldConfig } from "./types";
