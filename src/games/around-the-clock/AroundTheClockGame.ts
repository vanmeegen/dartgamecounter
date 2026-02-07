/**
 * Around the Clock Game implementation
 *
 * Rules:
 * - Hit numbers 1 through 20 in sequence
 * - Any segment (single/double/triple) counts as hitting the number
 * - Optional: include Bull as final target after 20
 * - Optional: doubles advance 2, triples advance 3
 * - First player to complete the sequence wins
 * - 3 darts per visit
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue } from "../../types/dart.types";
import type { AroundTheClockConfig, AroundTheClockPlayerState, ATCDartSnapshot } from "./types";

export class AroundTheClockGame implements Game {
  readonly type = "around-the-clock" as const;
  readonly config: AroundTheClockConfig;
  readonly players: Player[];
  playerStates: AroundTheClockPlayerState[];
  currentPlayerIndex = 0;
  currentVisit: Visit = { darts: [], total: 0, busted: false };
  dartSnapshots: ATCDartSnapshot[] = [];
  finished = false;
  legFinished = false;
  winnerId: string | null = null;
  currentLeg = 1;
  legStartingPlayerIndex = 0;

  constructor(players: Player[], config: AroundTheClockConfig) {
    this.players = players;
    this.config = config;
    this.playerStates = this.createPlayerStates();
    makeAutoObservable(this);
  }

  private createPlayerStates(): AroundTheClockPlayerState[] {
    return this.players.map((p) => ({
      playerId: p.id,
      currentTarget: 1,
      legsWon: 0,
    }));
  }

  private getMaxTarget(): number {
    return this.config.includesBull ? 25 : 20;
  }

  private getNextTarget(current: number, advance: number): number {
    if (current <= 20) {
      const next = current + advance;
      if (next > 20) {
        return this.config.includesBull ? 25 : 21; // 21 = past finish
      }
      return next;
    }
    return current + advance; // Past bull
  }

  getPlayerTarget(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    return ps?.currentTarget ?? 1;
  }

  getPlayerScore(playerId: string): number {
    return this.getPlayerTarget(playerId);
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

    // Save snapshot
    this.dartSnapshots.push({
      playerId: ps.playerId,
      previousTarget: ps.currentTarget,
    });

    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);

    // Check if this dart hits the current target
    const hitTarget = this.isTargetHit(dart, ps.currentTarget);
    if (hitTarget) {
      const advance = this.config.doublesAdvanceExtra ? dart.multiplier : 1;
      ps.currentTarget = this.getNextTarget(ps.currentTarget, advance);

      // Check win: target is past the max
      const maxTarget = this.getMaxTarget();
      if (
        ps.currentTarget > maxTarget ||
        (ps.currentTarget === 25 && !this.config.includesBull && ps.currentTarget > 20)
      ) {
        this.legFinished = true;
        ps.legsWon += 1;
        if (ps.legsWon >= this.config.legs) {
          this.finished = true;
          this.winnerId = ps.playerId;
        }
        this.endVisit();
        return;
      }
    }

    if (this.currentVisit.darts.length >= 3) {
      this.endVisit();
    }
  }

  private isTargetHit(dart: Dart, target: number): boolean {
    if (target === 25) {
      // Bull target: 25 (single) or 50 (double) both count
      return dart.segment === 25 || dart.segment === 50;
    }
    return dart.segment === target;
  }

  private endVisit(): void {
    if (!this.finished && !this.legFinished) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    if (this.dartSnapshots.length === 0) return false;

    const snapshot = this.dartSnapshots.pop();
    if (!snapshot) return false;
    const ps = this.playerStates.find((s) => s.playerId === snapshot.playerId);
    if (!ps) return false;

    if (this.currentVisit.darts.length === 0) {
      this.currentPlayerIndex = this.players.findIndex((p) => p.id === snapshot.playerId);
    }

    ps.currentTarget = snapshot.previousTarget;

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
      ps.legsWon = Math.max(0, ps.legsWon - 1);
    }

    return true;
  }

  nextLeg(): void {
    if (!this.legFinished || this.finished) return;
    this.currentLeg += 1;
    this.legStartingPlayerIndex = (this.legStartingPlayerIndex + 1) % this.players.length;
    this.currentPlayerIndex = this.legStartingPlayerIndex;
    for (const ps of this.playerStates) {
      ps.currentTarget = 1;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.dartSnapshots = [];
    this.legFinished = false;
  }
}
