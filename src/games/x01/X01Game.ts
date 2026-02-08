/**
 * X01 Game implementation (301, 501, etc.)
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue, isDouble } from "../../types/dart.types";
import { getCheckoutSuggestion } from "./checkout";
import type {
  X01Config,
  X01State,
  X01PlayerScore,
  CheckoutSuggestion,
  CompletedLeg,
} from "./types";

export class X01Game implements Game {
  readonly type = "x01" as const;
  readonly config: X01Config;
  readonly players: Player[];
  state: X01State;
  lastCompletedVisit: Visit | null = null;

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
      legStartingPlayerIndex: 0,
      visitHistory: [],
      completedLegs: [],
      finished: false,
      legFinished: false,
      winnerId: null,
    };
  }

  /**
   * Get the number of legs a player needs to win the match.
   * "First to N" means the player needs to win N legs.
   */
  getLegsToWin(): number {
    return this.config.legs;
  }

  /**
   * Check if the current leg is finished (but match may continue).
   */
  isLegFinished(): boolean {
    return this.state.legFinished;
  }

  /**
   * Start the next leg after a leg is won.
   * Rotates player order so next player starts.
   */
  nextLeg(): void {
    if (!this.state.legFinished || this.state.finished) return;

    // Save current leg's visit history before clearing
    const legWinner = this.state.players.find((ps) => ps.score === 0);
    this.state.completedLegs.push({
      legNumber: this.state.currentLeg,
      winnerId: legWinner?.playerId ?? null,
      visitHistory: [...this.state.visitHistory],
    });

    // Increment leg counter
    this.state.currentLeg += 1;

    // Rotate starting player for the new leg
    this.state.legStartingPlayerIndex =
      (this.state.legStartingPlayerIndex + 1) % this.players.length;
    this.state.currentPlayerIndex = this.state.legStartingPlayerIndex;

    // Reset scores for all players
    for (const playerScore of this.state.players) {
      playerScore.score = this.config.variant;
    }

    // Reset visit state
    this.state.currentVisit = { darts: [], total: 0, busted: false };
    this.state.visitHistory = [];
    this.state.legFinished = false;
  }

  recordThrow(dart: Dart): void {
    if (this.state.finished) return;
    if (this.state.legFinished) return; // Wait for nextLeg() call
    if (this.state.currentVisit.darts.length >= 3) return;
    this.lastCompletedVisit = null;

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

    // Check for checkout (leg won)
    if (newScore === 0) {
      currentPlayerScore.legsWon += 1;
      this.state.legFinished = true;

      // Check if match is won
      if (currentPlayerScore.legsWon >= this.getLegsToWin()) {
        this.state.finished = true;
        this.state.winnerId = currentPlayerScore.playerId;
      }

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

    // Save completed visit for display freeze, then reset
    this.lastCompletedVisit = {
      darts: [...this.state.currentVisit.darts],
      total: this.state.currentVisit.total,
      busted: this.state.currentVisit.busted,
    };
    this.state.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    this.lastCompletedVisit = null;
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

  getPlayerLegsWon(playerId: string): number {
    const playerScore = this.state.players.find((ps) => ps.playerId === playerId);
    return playerScore?.legsWon ?? 0;
  }

  private getCurrentPlayerScore(): X01PlayerScore {
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

    return getCheckoutSuggestion(score, dartsRemaining, this.config.outRule);
  }

  /**
   * Get the number of darts remaining in the current visit.
   */
  getDartsRemaining(): number {
    return 3 - this.state.currentVisit.darts.length;
  }

  /**
   * Get the average score per visit (3 darts) for a player.
   * Calculated as: (startingScore - currentScore) / dartsThrown * 3
   */
  getPlayerAverage(playerId: string): number {
    const playerScore = this.state.players.find((ps) => ps.playerId === playerId);
    if (!playerScore) return 0;

    // Count darts from completed visits
    let totalDarts = 0;
    for (const record of this.state.visitHistory) {
      if (record.playerId === playerId) {
        totalDarts += record.visit.darts.length;
      }
    }

    // Add current visit darts if this player is throwing
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id === playerId) {
      totalDarts += this.state.currentVisit.darts.length;
    }

    if (totalDarts === 0) return 0;

    const pointsScored = this.config.variant - playerScore.score;
    return (pointsScored / totalDarts) * 3;
  }

  /**
   * Get all completed legs including the current leg (if finished).
   * Used for statistics calculation.
   */
  getAllCompletedLegs(): CompletedLeg[] {
    const legs = [...this.state.completedLegs];
    // Include current leg if it's finished
    if (this.state.legFinished) {
      const legWinner = this.state.players.find((ps) => ps.score === 0);
      legs.push({
        legNumber: this.state.currentLeg,
        winnerId: legWinner?.playerId ?? null,
        visitHistory: [...this.state.visitHistory],
      });
    }
    return legs;
  }
}
