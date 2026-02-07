/**
 * StatisticsStore - manages all-time player statistics with IndexedDB persistence
 */

import { makeAutoObservable, runInAction } from "mobx";
import { openDB, type IDBPDatabase } from "idb";
import type { AllTimePlayerStats } from "../types";
import type { CompletedLeg } from "../types/game.types";
import { calculatePlayerStats } from "../utils/statistics";

const DB_NAME = "dartgamecounter";
const DB_VERSION = 3;
const STATS_STORE = "playerStatistics";

function createEmptyStats(playerName: string): AllTimePlayerStats {
  return {
    playerName,
    gamesPlayed: 0,
    gamesWon: 0,
    legsPlayed: 0,
    legsWon: 0,
    totalDarts: 0,
    totalPointsScored: 0,
    highestVisit: 0,
    bestLeg: null,
    visits60Plus: 0,
    visits100Plus: 0,
    visits140Plus: 0,
    visits180: 0,
    totalDartsInWonLegs: 0,
    wonLegCount: 0,
  };
}

export class StatisticsStore {
  allTimeStats = new Map<string, AllTimePlayerStats>();
  isLoading = true;
  private db: IDBPDatabase | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initDB();
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
          // Preserve existing stores
          if (!db.objectStoreNames.contains("presets")) {
            db.createObjectStore("presets", { keyPath: "id" });
          }
          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains("rememberedPlayers")) {
              db.createObjectStore("rememberedPlayers", { keyPath: "name" });
            }
          }
          if (oldVersion < 3) {
            if (!db.objectStoreNames.contains(STATS_STORE)) {
              db.createObjectStore(STATS_STORE, { keyPath: "playerName" });
            }
          }
        },
      });
      await this.loadStats();
    } catch {
      console.error("Failed to initialize statistics DB");
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private async loadStats(): Promise<void> {
    if (!this.db) return;

    try {
      const stats = await this.db.getAll(STATS_STORE);
      runInAction(() => {
        this.allTimeStats = new Map(stats.map((s: AllTimePlayerStats) => [s.playerName, s]));
        this.isLoading = false;
      });
    } catch {
      console.error("Failed to load statistics");
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Record a completed game's statistics for all players.
   */
  async recordGameStats(
    playerNames: string[],
    completedLegs: CompletedLeg[],
    playerIdToName: Map<string, string>,
    gameVariant: number,
    matchWinnerName: string | null
  ): Promise<void> {
    if (!this.db || completedLegs.length === 0) return;

    for (const playerName of playerNames) {
      const playerId = [...playerIdToName.entries()].find(([, name]) => name === playerName)?.[0];
      if (!playerId) continue;

      const gameStats = calculatePlayerStats(playerId, completedLegs, gameVariant);
      const existing = this.allTimeStats.get(playerName) ?? createEmptyStats(playerName);

      const updated: AllTimePlayerStats = {
        playerName,
        gamesPlayed: existing.gamesPlayed + 1,
        gamesWon: existing.gamesWon + (matchWinnerName === playerName ? 1 : 0),
        legsPlayed: existing.legsPlayed + gameStats.legsPlayed,
        legsWon: existing.legsWon + gameStats.legsWon,
        totalDarts: existing.totalDarts + gameStats.totalDarts,
        totalPointsScored: existing.totalPointsScored + gameStats.totalPointsScored,
        highestVisit: Math.max(existing.highestVisit, gameStats.highestVisit),
        bestLeg: minNullable(existing.bestLeg, gameStats.bestLeg),
        visits60Plus: existing.visits60Plus + gameStats.visits60Plus,
        visits100Plus: existing.visits100Plus + gameStats.visits100Plus,
        visits140Plus: existing.visits140Plus + gameStats.visits140Plus,
        visits180: existing.visits180 + gameStats.visits180,
        totalDartsInWonLegs:
          existing.totalDartsInWonLegs +
          (gameStats.dartsPerLeg !== null ? gameStats.dartsPerLeg * gameStats.legsWon : 0),
        wonLegCount: existing.wonLegCount + gameStats.legsWon,
      };

      try {
        await this.db.put(STATS_STORE, updated);
        runInAction(() => {
          this.allTimeStats.set(playerName, updated);
        });
      } catch {
        console.error(`Failed to save statistics for ${playerName}`);
      }
    }
  }

  /** Get all-time stats for a player */
  getPlayerStats(playerName: string): AllTimePlayerStats | null {
    return this.allTimeStats.get(playerName) ?? null;
  }

  /** Reset all statistics for a specific player */
  async resetPlayerStats(playerName: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.delete(STATS_STORE, playerName);
      runInAction(() => {
        this.allTimeStats.delete(playerName);
      });
      return true;
    } catch {
      console.error(`Failed to reset statistics for ${playerName}`);
      return false;
    }
  }
}

function minNullable(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}
