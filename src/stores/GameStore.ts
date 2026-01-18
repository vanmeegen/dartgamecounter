/**
 * GameStore - manages game configuration and current game instance
 */

import { makeAutoObservable } from "mobx";
import type { Player, X01Config, X01Variant, OutRule, Dart } from "../types";
import { X01Game } from "../games";

export class GameStore {
  // Configuration
  variant: X01Variant = 501;
  outRule: OutRule = "double";
  legs = 1;

  // Current game instance
  currentGame: X01Game | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setVariant(variant: X01Variant): void {
    this.variant = variant;
  }

  setOutRule(outRule: OutRule): void {
    this.outRule = outRule;
  }

  setLegs(legs: number): void {
    this.legs = Math.max(1, legs);
  }

  get config(): X01Config {
    return {
      variant: this.variant,
      outRule: this.outRule,
      legs: this.legs,
    };
  }

  startGame(players: Player[]): void {
    if (players.length === 0) return;
    this.currentGame = new X01Game(players, this.config);
  }

  recordThrow(dart: Dart): void {
    this.currentGame?.recordThrow(dart);
  }

  undoLastThrow(): boolean {
    return this.currentGame?.undoLastThrow() ?? false;
  }

  nextLeg(): void {
    this.currentGame?.nextLeg();
  }

  get isGameActive(): boolean {
    return this.currentGame !== null && !this.currentGame.isFinished();
  }

  get isGameFinished(): boolean {
    return this.currentGame?.isFinished() ?? false;
  }

  endGame(): void {
    this.currentGame = null;
  }

  reset(): void {
    this.currentGame = null;
    this.variant = 501;
    this.outRule = "double";
    this.legs = 1;
  }
}
