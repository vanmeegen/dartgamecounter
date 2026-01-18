/**
 * PlayerSetupStore - manages player list during setup
 */

import { makeAutoObservable } from "mobx";
import type { Player } from "../types";

export class PlayerSetupStore {
  players: Player[] = [];
  private nextId = 1;

  constructor() {
    makeAutoObservable(this);
  }

  addPlayer(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    this.players.push({
      id: `player-${this.nextId++}`,
      name: trimmedName,
    });
  }

  removePlayer(playerId: string): void {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  updatePlayerName(playerId: string, newName: string): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.name = newName.trim();
    }
  }

  reorderPlayers(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.players.length) return;
    if (toIndex < 0 || toIndex >= this.players.length) return;

    const [removed] = this.players.splice(fromIndex, 1);
    this.players.splice(toIndex, 0, removed);
  }

  get canProceed(): boolean {
    return this.players.length >= 1;
  }

  get playerCount(): number {
    return this.players.length;
  }

  reset(): void {
    this.players = [];
    this.nextId = 1;
  }
}
