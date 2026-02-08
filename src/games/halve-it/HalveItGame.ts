/**
 * Halve It Game implementation
 *
 * Rules:
 * - Predetermined targets each round (e.g., 20, 19, Doubles, Triples, Bull)
 * - Each player throws 3 darts per round at the current target
 * - Hit the target: add the dart's point value to your score
 * - Miss ALL 3 darts in a round: your score is HALVED (rounded down)
 * - Highest score after all rounds wins
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue } from "../../types/dart.types";
import type { HalveItConfig, HalveItTarget, HalveItPlayerState } from "./types";

/** Track per-dart scoring info for undo */
interface DartRecord {
  playerId: string;
  previousScore: number;
  dartScored: number;
  /** If this was the 3rd dart and triggered halving */
  halvingApplied: boolean;
  scoreBeforeHalving: number;
}

export class HalveItGame implements Game {
  readonly type = "halve-it" as const;
  readonly config: HalveItConfig;
  readonly players: Player[];
  playerStates: HalveItPlayerState[];
  currentPlayerIndex = 0;
  currentVisit: Visit = { darts: [], total: 0, busted: false };
  dartRecords: DartRecord[] = [];
  /** Current round index (0-based into config.targets) */
  roundIndex = 0;
  roundPlayerCount = 0;
  /** Track if current visit has hit the target at least once */
  visitHitTarget = false;
  /** Points scored in current visit (before potential halving) */
  visitPoints = 0;
  finished = false;
  legFinished = false;
  winnerId: string | null = null;
  currentLeg = 1;
  legStartingPlayerIndex = 0;
  lastCompletedVisit: Visit | null = null;

  constructor(players: Player[], config: HalveItConfig) {
    this.players = players;
    this.config = config;
    this.playerStates = this.createPlayerStates();
    makeAutoObservable(this);
  }

  private createPlayerStates(): HalveItPlayerState[] {
    return this.players.map((p) => ({
      playerId: p.id,
      score: this.config.startingScore,
      legsWon: 0,
    }));
  }

  getCurrentRound(): number {
    return this.roundIndex + 1;
  }

  getCurrentTarget(): HalveItTarget {
    return this.config.targets[this.roundIndex];
  }

  getPlayerScore(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    return ps?.score ?? 0;
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

  private isDartOnTarget(dart: Dart, target: HalveItTarget): boolean {
    switch (target.type) {
      case "number":
        return dart.segment === target.value;
      case "double":
        return dart.multiplier === 2;
      case "triple":
        return dart.multiplier === 3;
      case "bull":
        return dart.segment === 25 || dart.segment === 50;
    }
  }

  recordThrow(dart: Dart): void {
    if (this.finished || this.legFinished) return;
    if (this.currentVisit.darts.length >= 3) return;
    if (this.roundIndex >= this.config.targets.length) return;
    this.lastCompletedVisit = null;

    const ps = this.playerStates[this.currentPlayerIndex];
    const target = this.config.targets[this.roundIndex];
    const scoreBeforeThrow = ps.score;

    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);

    // Check if this dart hits the target
    const dartScored = this.isDartOnTarget(dart, target) ? getDartValue(dart) : 0;
    if (dartScored > 0) {
      this.visitHitTarget = true;
      this.visitPoints += dartScored;
      ps.score += dartScored;
    }

    let halvingApplied = false;
    const scoreBeforeHalving = ps.score;

    // After 3 darts, check for halving
    if (this.currentVisit.darts.length >= 3) {
      if (!this.visitHitTarget) {
        // Halve the score (floor)
        halvingApplied = true;
        ps.score = Math.floor(ps.score / 2);
      }
    }

    // Save record for undo
    this.dartRecords.push({
      playerId: ps.playerId,
      previousScore: scoreBeforeThrow,
      dartScored,
      halvingApplied,
      scoreBeforeHalving,
    });

    // End visit after 3 darts
    if (this.currentVisit.darts.length >= 3) {
      this.endVisit();
    }
  }

  private endVisit(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.roundPlayerCount += 1;

    // Reset visit tracking
    this.visitHitTarget = false;
    this.visitPoints = 0;

    // Check if all players threw this round
    if (this.roundPlayerCount >= this.players.length) {
      this.roundPlayerCount = 0;
      this.roundIndex += 1;

      // Check if all rounds done
      if (this.roundIndex >= this.config.targets.length) {
        this.legFinished = true;
        // Winner = highest score
        let bestScore = -Infinity;
        let bestPlayerId: string | null = null;
        for (const ps of this.playerStates) {
          if (ps.score > bestScore) {
            bestScore = ps.score;
            bestPlayerId = ps.playerId;
          }
        }
        this.winnerId = bestPlayerId;
        for (const ps of this.playerStates) {
          if (ps.playerId === bestPlayerId) {
            ps.legsWon += 1;
            if (ps.legsWon >= this.config.legs) {
              this.finished = true;
            }
            break;
          }
        }
      }
    }

    this.lastCompletedVisit = {
      darts: [...this.currentVisit.darts],
      total: this.currentVisit.total,
      busted: this.currentVisit.busted,
    };
    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    this.lastCompletedVisit = null;
    if (this.dartRecords.length === 0) return false;

    const record = this.dartRecords.pop();
    if (!record) return false;
    const ps = this.playerStates.find((s) => s.playerId === record.playerId);
    if (!ps) return false;

    // If we crossed a visit boundary, go back
    if (this.currentVisit.darts.length === 0) {
      this.currentPlayerIndex = this.players.findIndex((p) => p.id === record.playerId);
      // Revert round advancement
      if (this.roundPlayerCount === 0) {
        this.roundIndex -= 1;
        this.roundPlayerCount = this.players.length - 1;
      } else {
        this.roundPlayerCount -= 1;
      }
    }

    // Restore score
    ps.score = record.previousScore;

    // Remove dart from visit
    if (this.currentVisit.darts.length > 0) {
      const dart = this.currentVisit.darts.pop();
      if (!dart) return false;
      this.currentVisit.total -= getDartValue(dart);
    }

    // Recalculate visitHitTarget and visitPoints from remaining darts
    this.recalcVisitState();

    if (this.finished) {
      this.finished = false;
      this.winnerId = null;
    }
    if (this.legFinished) {
      this.legFinished = false;
      ps.legsWon = Math.max(0, ps.legsWon - 1);
    }

    return true;
  }

  private recalcVisitState(): void {
    if (this.roundIndex >= this.config.targets.length) {
      this.visitHitTarget = false;
      this.visitPoints = 0;
      return;
    }
    const target = this.config.targets[this.roundIndex];
    this.visitHitTarget = false;
    this.visitPoints = 0;
    for (const dart of this.currentVisit.darts) {
      const scored = this.isDartOnTarget(dart, target) ? getDartValue(dart) : 0;
      if (scored > 0) {
        this.visitHitTarget = true;
        this.visitPoints += scored;
      }
    }
  }

  nextLeg(): void {
    if (!this.legFinished || this.finished) return;
    this.currentLeg += 1;
    this.legStartingPlayerIndex = (this.legStartingPlayerIndex + 1) % this.players.length;
    this.currentPlayerIndex = this.legStartingPlayerIndex;
    this.roundIndex = 0;
    this.roundPlayerCount = 0;
    this.visitHitTarget = false;
    this.visitPoints = 0;
    for (const ps of this.playerStates) {
      ps.score = this.config.startingScore;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.dartRecords = [];
    this.legFinished = false;
    this.winnerId = null;
  }
}
