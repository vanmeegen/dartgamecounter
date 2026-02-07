/**
 * Cricket Game implementation
 *
 * Rules:
 * - Cricket numbers: 15, 16, 17, 18, 19, 20, Bull (25)
 * - Hit a number 3 times to "close" it (single=1, double=2, triple=3 marks)
 * - Once you close a number, additional hits score points (if opponent hasn't closed it)
 * - Game ends when a player closes all numbers and has >= opponent's points
 * - Bull: single bull (25) = 1 mark, double bull (50) = 2 marks, points = 25 per mark
 */

import { makeAutoObservable } from "mobx";
import type { Game } from "../types";
import type { Dart, Player, Visit } from "../../types";
import { getDartValue } from "../../types/dart.types";
import {
  CRICKET_NUMBERS,
  type CricketConfig,
  type CricketNumber,
  type CricketPlayerState,
  type CricketDartSnapshot,
} from "./types";

export class CricketGame implements Game {
  readonly type = "cricket" as const;
  readonly config: CricketConfig;
  readonly players: Player[];
  playerStates: CricketPlayerState[];
  currentPlayerIndex = 0;
  currentVisit: Visit = { darts: [], total: 0, busted: false };
  /** Stack of snapshots for undo (one per dart thrown) */
  dartSnapshots: CricketDartSnapshot[] = [];
  finished = false;
  legFinished = false;
  winnerId: string | null = null;
  currentLeg = 1;
  legStartingPlayerIndex = 0;

  constructor(players: Player[], config: CricketConfig) {
    this.players = players;
    this.config = config;
    this.playerStates = this.createPlayerStates();
    makeAutoObservable(this);
  }

  private createPlayerStates(): CricketPlayerState[] {
    return this.players.map((p) => ({
      playerId: p.id,
      marks: new Map(CRICKET_NUMBERS.map((n) => [n, 0])),
      points: 0,
      legsWon: 0,
    }));
  }

  getCricketNumbers(): number[] {
    return [...CRICKET_NUMBERS];
  }

  getPlayerMarks(playerId: string): Map<number, number> {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    if (!ps) return new Map();
    return new Map(ps.marks);
  }

  getPlayerScore(playerId: string): number {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    return ps?.points ?? 0;
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

  private toCricketNumber(dart: Dart): { number: CricketNumber; marks: number } | null {
    if (dart.segment === 50) {
      return { number: 25, marks: 2 };
    }
    if (dart.segment === 25) {
      return { number: 25, marks: 1 };
    }
    if (CRICKET_NUMBERS.includes(dart.segment as CricketNumber) && dart.segment !== 25) {
      return { number: dart.segment as CricketNumber, marks: dart.multiplier };
    }
    return null;
  }

  recordThrow(dart: Dart): void {
    if (this.finished || this.legFinished) return;
    if (this.currentVisit.darts.length >= 3) return;

    const ps = this.playerStates[this.currentPlayerIndex];

    // Save snapshot for undo
    this.dartSnapshots.push({
      playerId: ps.playerId,
      marks: new Map(ps.marks),
      points: ps.points,
    });

    // Add dart to visit
    this.currentVisit.darts.push(dart);
    this.currentVisit.total += getDartValue(dart);

    // Apply cricket scoring
    const cricketHit = this.toCricketNumber(dart);
    if (cricketHit) {
      const currentMarks = ps.marks.get(cricketHit.number) ?? 0;
      const newMarks = currentMarks + cricketHit.marks;
      const marksToClose = this.config.marksToClose;

      if (currentMarks < marksToClose) {
        // Some marks go toward closing
        const closingMarks = Math.min(cricketHit.marks, marksToClose - currentMarks);
        const extraMarks = cricketHit.marks - closingMarks;

        ps.marks.set(cricketHit.number, Math.min(newMarks, marksToClose + extraMarks));

        // Score points from extra marks if opponent hasn't closed
        if (extraMarks > 0 && !this.allOpponentsClosed(ps.playerId, cricketHit.number)) {
          const pointValue = cricketHit.number === 25 ? 25 : cricketHit.number;
          ps.points += extraMarks * pointValue;
        }
      } else {
        // Already closed - score points if opponent hasn't closed
        if (!this.allOpponentsClosed(ps.playerId, cricketHit.number)) {
          const pointValue = cricketHit.number === 25 ? 25 : cricketHit.number;
          ps.points += cricketHit.marks * pointValue;
        }
      }

      // Update marks count
      ps.marks.set(cricketHit.number, newMarks);
    }

    // Check for win
    if (this.hasClosedAll(ps.playerId) && this.hasHighestOrTiedScore(ps.playerId)) {
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

  private allOpponentsClosed(playerId: string, num: CricketNumber): boolean {
    return this.playerStates
      .filter((s) => s.playerId !== playerId)
      .every((s) => (s.marks.get(num) ?? 0) >= this.config.marksToClose);
  }

  private hasClosedAll(playerId: string): boolean {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    if (!ps) return false;
    return CRICKET_NUMBERS.every((num) => (ps.marks.get(num) ?? 0) >= this.config.marksToClose);
  }

  private hasHighestOrTiedScore(playerId: string): boolean {
    const ps = this.playerStates.find((s) => s.playerId === playerId);
    if (!ps) return false;
    return this.playerStates.every((s) => s.playerId === playerId || ps.points >= s.points);
  }

  private endVisit(): void {
    if (!this.finished && !this.legFinished) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
  }

  undoLastThrow(): boolean {
    if (this.dartSnapshots.length === 0) {
      return false;
    }

    const snapshot = this.dartSnapshots.pop();
    if (!snapshot) return false;
    const ps = this.playerStates.find((s) => s.playerId === snapshot.playerId);
    if (!ps) return false;

    // Check if we need to undo across a visit boundary
    if (this.currentVisit.darts.length === 0) {
      // Need to go back to previous player's visit
      this.currentPlayerIndex = this.players.findIndex((p) => p.id === snapshot.playerId);
    }

    // Restore state
    ps.marks = new Map(snapshot.marks);
    ps.points = snapshot.points;

    // Remove dart from visit or restore previous visit
    if (this.currentVisit.darts.length > 0) {
      const dart = this.currentVisit.darts.pop();
      if (!dart) return false;
      this.currentVisit.total -= getDartValue(dart);
    }

    // Clear finished state
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

    // Reset marks and points, preserve legsWon
    for (const ps of this.playerStates) {
      ps.marks = new Map(CRICKET_NUMBERS.map((n) => [n, 0]));
      ps.points = 0;
    }
    this.currentVisit = { darts: [], total: 0, busted: false };
    this.dartSnapshots = [];
    this.legFinished = false;
  }
}
