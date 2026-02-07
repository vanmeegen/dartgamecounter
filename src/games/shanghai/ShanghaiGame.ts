/**
 * Shanghai Game implementation
 *
 * Rules:
 * - Played over N rounds, targeting numbers startNumber, startNumber+1, etc.
 * - Each round, all players throw 3 darts at the round's target number only
 * - Hitting the target scores points (single=1x, double=2x, triple=3x of the number)
 * - Hitting any other number scores 0
 * - "Shanghai" = single + double + triple of the target in one visit = instant win
 * - After all rounds, highest total score wins
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue } from "../../types/dart.types";
import type { ShanghaiConfig, ShanghaiPlayerState, ShanghaiDartSnapshot } from "./types";

export class ShanghaiGame implements Game {
  readonly type = "shanghai" as const;
  readonly config: ShanghaiConfig;
  readonly players: Player[];
  playerStates: ShanghaiPlayerState[];
  currentPlayerIndex = 0;
  currentVisit: Visit = { darts: [], total: 0, busted: false };
  dartSnapshots: ShanghaiDartSnapshot[] = [];
  /** Current round (1-based) */
  round = 1;
  /** Tracks which player index in the round we're on */
  roundPlayerCount = 0;
  finished = false;
  legFinished = false;
  winnerId: string | null = null;
  currentLeg = 1;
  legStartingPlayerIndex = 0;

  constructor(players: Player[], config: ShanghaiConfig) {
    this.players = players;
    this.config = config;
    this.playerStates = this.createPlayerStates();
    makeAutoObservable(this);
  }

  private createPlayerStates(): ShanghaiPlayerState[] {
    return this.players.map((p) => ({
      playerId: p.id,
      totalScore: 0,
      legsWon: 0,
    }));
  }

  getCurrentRound(): number {
    return this.round;
  }

  getCurrentTargetNumber(): number {
    return this.config.startNumber + this.round - 1;
  }

  getPlayerScore(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    return ps?.totalScore ?? 0;
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  isFinished(): boolean {
    return this.finished;
  }

  isLegFinished(): boolean {
    return this.legFinished;
  }

  getWinner(): Player | null {
    if (!this.winnerId) return null;
    return this.players.find((p) => p.id === this.winnerId) ?? null;
  }

  recordThrow(dart: Dart): void {
    if (this.finished || this.legFinished) return;
    if (this.currentVisit.darts.length >= 3) return;

    const ps = this.playerStates[this.currentPlayerIndex];
    const targetNum = this.getCurrentTargetNumber();

    // Save snapshot
    this.dartSnapshots.push({
      playerId: ps.playerId,
      previousScore: ps.totalScore,
      wasFinished: this.finished,
      wasLegFinished: this.legFinished,
    });

    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);

    // Score points only if hitting the target number
    if (dart.segment === targetNum) {
      ps.totalScore += dart.segment * dart.multiplier;
    }

    // Check for Shanghai (single + double + triple of target in this visit)
    if (this.currentVisit.darts.length <= 3 && this.isShanghai(targetNum)) {
      this.legFinished = true;
      ps.legsWon += 1;
      if (ps.legsWon >= this.config.legs) {
        this.finished = true;
        this.winnerId = ps.playerId;
      }
      this.endVisit();
      return;
    }

    // End visit after 3 darts
    if (this.currentVisit.darts.length >= 3) {
      this.endVisit();
    }
  }

  private isShanghai(targetNum: number): boolean {
    const targetDarts = this.currentVisit.darts.filter((d) => d.segment === targetNum);
    if (targetDarts.length < 3) return false;
    const multipliers = new Set(targetDarts.map((d) => d.multiplier));
    return multipliers.has(1) && multipliers.has(2) && multipliers.has(3);
  }

  private endVisit(): void {
    // Advance to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.roundPlayerCount += 1;

    // Check if all players have thrown this round
    if (this.roundPlayerCount >= this.players.length) {
      this.roundPlayerCount = 0;
      this.round += 1;

      // Check if all rounds done
      if (this.round > this.config.rounds) {
        this.legFinished = true;
        // Find winner by highest score
        let bestScore = -1;
        let bestPlayerId: string | null = null;
        for (const ps of this.playerStates) {
          if (ps.totalScore > bestScore) {
            bestScore = ps.totalScore;
            bestPlayerId = ps.playerId;
          }
        }
        this.winnerId = bestPlayerId;
        ps_legs: for (const ps of this.playerStates) {
          if (ps.playerId === bestPlayerId) {
            ps.legsWon += 1;
            if (ps.legsWon >= this.config.legs) {
              this.finished = true;
            }
            break ps_legs;
          }
        }
      }
    }

    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    if (this.dartSnapshots.length === 0) return false;

    const snapshot = this.dartSnapshots.pop();
    if (!snapshot) return false;
    const ps = this.playerStates.find((s) => s.playerId === snapshot.playerId);
    if (!ps) return false;

    // Restore score
    ps.totalScore = snapshot.previousScore;

    // Handle visit boundary
    if (this.currentVisit.darts.length === 0) {
      // Need to go back to previous player
      this.currentPlayerIndex = this.players.findIndex((p) => p.id === snapshot.playerId);
      // Revert round advancement
      if (this.roundPlayerCount === 0) {
        this.round -= 1;
        this.roundPlayerCount = this.players.length - 1;
      } else {
        this.roundPlayerCount -= 1;
      }
    }

    if (this.currentVisit.darts.length > 0) {
      const dart = this.currentVisit.darts.pop();
      if (!dart) return false;
      this.currentVisit.total -= getDartValue(dart);
    }

    if (this.finished) {
      this.finished = false;
      this.winnerId = null;
    }
    if (this.legFinished) {
      this.legFinished = false;
      // Revert leg win
      ps.legsWon = Math.max(0, ps.legsWon - 1);
    }

    return true;
  }

  nextLeg(): void {
    if (!this.legFinished || this.finished) return;
    this.currentLeg += 1;
    this.legStartingPlayerIndex = (this.legStartingPlayerIndex + 1) % this.players.length;
    this.currentPlayerIndex = this.legStartingPlayerIndex;
    this.round = 1;
    this.roundPlayerCount = 0;
    for (const ps of this.playerStates) {
      ps.totalScore = 0;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.dartSnapshots = [];
    this.legFinished = false;
    this.winnerId = null;
  }
}
