/**
 * Around the World Game implementation
 *
 * Rules:
 * - Hit numbers 1 through 20, then Bull (25) to finish
 * - Singles advance 1, Doubles advance 2, Triples advance 3
 * - First player to complete the full sequence wins
 * - 3 darts per visit
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue } from "../../types/dart.types";
import {
  ATW_SEQUENCE,
  type AroundTheWorldConfig,
  type AroundTheWorldPlayerState,
  type ATWDartSnapshot,
} from "./types";

export class AroundTheWorldGame implements Game {
  readonly type = "around-the-world" as const;
  readonly config: AroundTheWorldConfig;
  readonly players: Player[];
  playerStates: AroundTheWorldPlayerState[];
  currentPlayerIndex = 0;
  currentVisit: Visit = { darts: [], total: 0, busted: false };
  dartSnapshots: ATWDartSnapshot[] = [];
  finished = false;
  legFinished = false;
  winnerId: string | null = null;
  currentLeg = 1;
  legStartingPlayerIndex = 0;
  lastCompletedVisit: Visit | null = null;

  constructor(players: Player[], config: AroundTheWorldConfig) {
    this.players = players;
    this.config = config;
    this.playerStates = this.createPlayerStates();
    makeAutoObservable(this);
  }

  private createPlayerStates(): AroundTheWorldPlayerState[] {
    return this.players.map((p) => ({
      playerId: p.id,
      sequenceIndex: 0,
      legsWon: 0,
    }));
  }

  getSequenceLength(): number {
    return ATW_SEQUENCE.length;
  }

  getPlayerTarget(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    if (!ps) return 1;
    if (ps.sequenceIndex >= ATW_SEQUENCE.length) return 0; // finished
    return ATW_SEQUENCE[ps.sequenceIndex];
  }

  /** Returns number of targets hit (progress) */
  getPlayerScore(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    return ps?.sequenceIndex ?? 0;
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
    this.lastCompletedVisit = null;

    const ps = this.playerStates[this.currentPlayerIndex];

    // Save snapshot
    this.dartSnapshots.push({
      playerId: ps.playerId,
      previousIndex: ps.sequenceIndex,
    });

    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);

    // Check if dart hits current target
    if (ps.sequenceIndex < ATW_SEQUENCE.length) {
      const target = ATW_SEQUENCE[ps.sequenceIndex];
      const hit = this.isTargetHit(dart, target);

      if (hit) {
        const advance = dart.multiplier; // singles=1, doubles=2, triples=3
        const newIndex = Math.min(ps.sequenceIndex + advance, ATW_SEQUENCE.length);
        ps.sequenceIndex = newIndex;

        // Check win
        if (ps.sequenceIndex >= ATW_SEQUENCE.length) {
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
    }

    if (this.currentVisit.darts.length >= 3) {
      this.endVisit();
    }
  }

  private isTargetHit(dart: Dart, target: number): boolean {
    if (target === 25) {
      return dart.segment === 25 || dart.segment === 50;
    }
    return dart.segment === target;
  }

  private endVisit(): void {
    if (!this.finished && !this.legFinished) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
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
    if (this.dartSnapshots.length === 0) return false;

    const snapshot = this.dartSnapshots.pop();
    if (!snapshot) return false;
    const ps = this.playerStates.find((s) => s.playerId === snapshot.playerId);
    if (!ps) return false;

    if (this.currentVisit.darts.length === 0) {
      this.currentPlayerIndex = this.players.findIndex((p) => p.id === snapshot.playerId);
    }

    ps.sequenceIndex = snapshot.previousIndex;

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
      ps.sequenceIndex = 0;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.dartSnapshots = [];
    this.legFinished = false;
  }
}
