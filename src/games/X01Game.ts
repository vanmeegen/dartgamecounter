/**
 * X01 Game implementation (301, 501, etc.)
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "./Game";
import type { Dart, Player, PlayerScore, X01Config, X01State, CheckoutSuggestion } from "../types";
import { getDartValue, isDouble } from "../types/dart.types";

export class X01Game implements Game {
  readonly type = "x01" as const;
  readonly config: X01Config;
  readonly players: Player[];
  state: X01State;

  constructor(players: Player[], config: X01Config) {
    this.players = players;
    this.config = config;
    this.state = this.initializeState();
    makeAutoObservable(this);
  }

  private initializeState(): X01State {
    return {
      players: this.players.map((p) => ({
        playerId: p.id,
        score: this.config.variant,
        legsWon: 0,
      })),
      currentPlayerIndex: 0,
      currentVisit: { darts: [], total: 0, busted: false },
      currentLeg: 1,
      visitHistory: [],
      finished: false,
      winnerId: null,
    };
  }

  recordThrow(dart: Dart): void {
    if (this.state.finished) return;
    if (this.state.currentVisit.darts.length >= 3) return;

    const currentPlayerScore = this.getCurrentPlayerScore();
    const dartValue = getDartValue(dart);
    const newScore = currentPlayerScore.score - dartValue;

    // Record the dart and update score
    this.state.currentVisit.darts.push(dart);
    this.state.currentVisit.total += dartValue;
    currentPlayerScore.score = newScore;

    // Check for bust
    if (this.isBust(newScore, dart)) {
      this.state.currentVisit.busted = true;
      this.endVisit(true);
      return;
    }

    // Check for checkout
    if (newScore === 0) {
      this.state.finished = true;
      this.state.winnerId = currentPlayerScore.playerId;
      this.endVisit(false);
      return;
    }

    // End visit after 3 darts
    if (this.state.currentVisit.darts.length === 3) {
      this.endVisit(false);
    }
  }

  private isBust(newScore: number, dart: Dart): boolean {
    if (newScore < 0) return true;
    if (this.config.outRule === "double") {
      if (newScore === 1) return true; // Can't finish with 1 on double out
      if (newScore === 0 && !isDouble(dart)) return true;
    }
    return false;
  }

  private endVisit(busted: boolean): void {
    const currentPlayerScore = this.getCurrentPlayerScore();
    const scoreBeforeVisit = currentPlayerScore.score + this.state.currentVisit.total;

    // If busted, revert score to what it was before the visit
    if (busted) {
      currentPlayerScore.score = scoreBeforeVisit;
    }

    // Save to history (score after is the final score for this visit)
    this.state.visitHistory.push({
      playerId: currentPlayerScore.playerId,
      visit: { ...this.state.currentVisit },
      scoreAfter: currentPlayerScore.score,
    });

    // Move to next player
    if (!this.state.finished) {
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.players.length;
    }

    // Reset current visit
    this.state.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    // If current visit has darts, remove the last one
    if (this.state.currentVisit.darts.length > 0) {
      const lastDart = this.state.currentVisit.darts.pop();
      if (!lastDart) return false;

      const dartValue = getDartValue(lastDart);
      this.state.currentVisit.total -= dartValue;

      // Restore score
      const currentPlayerScore = this.getCurrentPlayerScore();
      currentPlayerScore.score += dartValue;

      // Clear finished state if we undid a checkout
      if (this.state.finished) {
        this.state.finished = false;
        this.state.winnerId = null;
      }

      return true;
    }

    // If no darts in current visit, undo the previous visit
    if (this.state.visitHistory.length > 0) {
      const lastVisitRecord = this.state.visitHistory.pop();
      if (!lastVisitRecord) return false;
      const playerIndex = this.players.findIndex((p) => p.id === lastVisitRecord.playerId);

      if (playerIndex !== -1) {
        // Calculate score before the visit
        const scoreBeforeVisit = lastVisitRecord.visit.busted
          ? lastVisitRecord.scoreAfter // Score didn't change on bust
          : lastVisitRecord.scoreAfter + lastVisitRecord.visit.total;

        // Restore player's score
        const playerScore = this.state.players.find(
          (ps) => ps.playerId === lastVisitRecord.playerId
        );
        if (playerScore) {
          playerScore.score = scoreBeforeVisit;
        }

        // Set current player to the one whose visit we're restoring
        this.state.currentPlayerIndex = playerIndex;

        // Restore the visit (minus the last dart which we'll "remove")
        const restoredDarts = [...lastVisitRecord.visit.darts];
        if (restoredDarts.length > 0) {
          restoredDarts.pop(); // Remove the last dart
        }

        // Recalculate total for remaining darts
        const restoredTotal = restoredDarts.reduce((sum, d) => sum + getDartValue(d), 0);

        // If there were darts before the last one, restore partial visit
        this.state.currentVisit = {
          darts: restoredDarts,
          total: restoredTotal,
          busted: false,
        };

        // Subtract the restored darts from score
        if (playerScore && restoredTotal > 0) {
          playerScore.score -= restoredTotal;
        }

        return true;
      }
    }

    return false;
  }

  isFinished(): boolean {
    return this.state.finished;
  }

  getWinner(): Player | null {
    if (!this.state.winnerId) return null;
    return this.players.find((p) => p.id === this.state.winnerId) ?? null;
  }

  getCurrentPlayer(): Player {
    return this.players[this.state.currentPlayerIndex];
  }

  getPlayerScore(playerId: string): number {
    const playerScore = this.state.players.find((ps) => ps.playerId === playerId);
    return playerScore?.score ?? 0;
  }

  private getCurrentPlayerScore(): PlayerScore {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /**
   * Get checkout suggestion for current player.
   * Returns null if score > 170 or no checkout possible.
   */
  getCheckoutSuggestion(): CheckoutSuggestion | null {
    const score = this.getCurrentPlayerScore().score;
    const dartsRemaining = 3 - this.state.currentVisit.darts.length;

    if (score > 170 || dartsRemaining === 0) return null;

    // TODO: Implement checkout calculator in E4
    return null;
  }

  /**
   * Get the number of darts remaining in the current visit.
   */
  getDartsRemaining(): number {
    return 3 - this.state.currentVisit.darts.length;
  }
}
