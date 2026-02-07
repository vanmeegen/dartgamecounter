/**
 * Game infrastructure exports
 */

export type {
  Game,
  GameDefinition,
  GameConfigComponentProps,
  GamePlayComponentProps,
} from "./types";
export { gameRegistry } from "./registry";

// Re-export X01 module
export * from "./x01";
