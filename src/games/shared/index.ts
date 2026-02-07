/**
 * Shared game utilities - composable helpers for all game modules.
 *
 * Games import from here for common visit/turn mechanics.
 * No game-specific logic lives here.
 */

export { VisitTracker } from "./VisitTracker";
export type { TrackedVisit } from "./VisitTracker";
