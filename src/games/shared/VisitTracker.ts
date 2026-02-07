/**
 * VisitTracker - composable utility for managing dart visits and player turns.
 *
 * Handles the universal mechanics shared by all dart games:
 * - Current visit (up to 3 darts)
 * - Visit history for undo
 * - Player turn rotation
 *
 * Games compose with this rather than inheriting from a base class,
 * keeping each game's logic self-contained.
 */

import type { Dart, Visit, Player } from "../../types";
import { getDartValue } from "../../types/dart.types";

export interface TrackedVisit {
  playerId: string;
  visit: Visit;
}

export class VisitTracker {
  readonly players: Player[];
  currentPlayerIndex: number;
  currentVisit: Visit;
  visitHistory: TrackedVisit[];

  constructor(players: Player[], startingPlayerIndex = 0) {
    this.players = players;
    this.currentPlayerIndex = startingPlayerIndex;
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.visitHistory = [];
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  dartsRemaining(): number {
    return 3 - this.currentVisit.darts.length;
  }

  isVisitComplete(): boolean {
    return this.currentVisit.darts.length >= 3;
  }

  /**
   * Add a dart to the current visit.
   * Returns false if the visit already has 3 darts.
   */
  addDart(dart: Dart): boolean {
    if (this.currentVisit.darts.length >= 3) return false;
    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);
    return true;
  }

  /**
   * End the current visit: save to history and advance player.
   * @param busted - whether this visit was a bust
   * @param skipAdvance - if true, don't advance to the next player
   */
  endVisit(busted: boolean, skipAdvance?: boolean): void {
    this.currentVisit.busted = busted;
    this.visitHistory.push({
      playerId: this.getCurrentPlayer().id,
      visit: { ...this.currentVisit, darts: [...this.currentVisit.darts] },
    });

    if (!skipAdvance) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  /**
   * Remove the last dart from the current visit.
   * Returns the removed dart, or null if the visit is empty.
   */
  undoLastDart(): Dart | null {
    if (this.currentVisit.darts.length === 0) return null;
    const dart = this.currentVisit.darts.pop();
    if (!dart) return null;
    this.currentVisit.total -= getDartValue(dart);
    return dart;
  }

  /**
   * Undo back into the previous visit (when current visit is empty).
   * Restores the previous visit with its last dart removed.
   * Returns the tracked visit that was restored, or null if no history.
   */
  undoPreviousVisit(): TrackedVisit | null {
    if (this.visitHistory.length === 0) return null;
    const last = this.visitHistory.pop();
    if (!last) return null;
    const playerIndex = this.players.findIndex((p) => p.id === last.playerId);
    if (playerIndex !== -1) {
      this.currentPlayerIndex = playerIndex;
    }

    // Restore visit minus last dart
    const restoredDarts = [...last.visit.darts];
    if (restoredDarts.length > 0) {
      restoredDarts.pop();
    }
    const restoredTotal = restoredDarts.reduce((sum, d) => sum + getDartValue(d), 0);
    this.currentVisit = {
      darts: restoredDarts,
      total: restoredTotal,
      busted: false,
    };

    return last;
  }

  /**
   * Clear the current visit without saving to history.
   */
  resetVisit(): void {
    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  /**
   * Reset all state (for new leg/round).
   */
  resetAll(startingPlayerIndex: number): void {
    this.currentPlayerIndex = startingPlayerIndex;
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.visitHistory = [];
  }
}
