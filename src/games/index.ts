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

// Shared utilities
export { VisitTracker } from "./shared";

// Re-export game modules
export * from "./x01";
export * from "./cricket";
export * from "./around-the-clock";
export * from "./around-the-world";
export * from "./shanghai";
export * from "./halve-it";
