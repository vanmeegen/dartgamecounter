/**
 * StatisticsStore - manages per-game all-time player statistics with IndexedDB persistence.
 *
 * Statistics are stored per (gameType, playerName) pair.
 * Each game module defines its own stats shape; this store handles generic storage.
 */

import { makeAutoObservable, runInAction } from "mobx";
import { openDB, type IDBPDatabase } from "idb";
import type { StoredPlayerStats } from "../types";
import { calculateX01PlayerStats, createEmptyX01Stats } from "../games/x01/statistics";
import type { X01AllTimePlayerStats, CompletedLeg } from "../games/x01/types";

const DB_NAME = "dartgamecounter";
const DB_VERSION = 4;
const STATS_STORE = "playerStatistics";

function makeKey(gameType: string, playerName: string): string {
  return `${gameType}:${playerName}`;
}

export class StatisticsStore {
  /** Map of all-time stats keyed by `${gameType}:${playerName}` */
  allTimeStats = new Map<string, StoredPlayerStats>();
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
          // Migrate from v3 (old playerStatistics by playerName) to v4 (by composite key)
          if (oldVersion < 4) {
            if (db.objectStoreNames.contains(STATS_STORE)) {
              db.deleteObjectStore(STATS_STORE);
            }
            db.createObjectStore(STATS_STORE, { keyPath: "key" });
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
        this.allTimeStats = new Map(stats.map((s: StoredPlayerStats) => [s.key, s]));
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
   * Record game statistics for X01.
   * Dispatches to game-specific stats calculation.
   */
  async recordGameStats(
    gameType: string,
    playerNames: string[],
    completedLegs: CompletedLeg[],
    playerIdToName: Map<string, string>,
    gameVariant: number,
    matchWinnerName: string | null
  ): Promise<void> {
    if (!this.db || completedLegs.length === 0) return;

    if (gameType === "x01") {
      await this.recordX01Stats(
        playerNames,
        completedLegs,
        playerIdToName,
        gameVariant,
        matchWinnerName
      );
    }
    // Future game types add their own branches here
  }

  private async recordX01Stats(
    playerNames: string[],
    completedLegs: CompletedLeg[],
    playerIdToName: Map<string, string>,
    gameVariant: number,
    matchWinnerName: string | null
  ): Promise<void> {
    if (!this.db) return;

    for (const playerName of playerNames) {
      const playerId = [...playerIdToName.entries()].find(([, name]) => name === playerName)?.[0];
      if (!playerId) continue;

      const gameStats = calculateX01PlayerStats(playerId, completedLegs, gameVariant);
      const key = makeKey("x01", playerName);
      const existingRecord = this.allTimeStats.get(key);
      const existing: X01AllTimePlayerStats = existingRecord
        ? (existingRecord.data as unknown as X01AllTimePlayerStats)
        : createEmptyX01Stats(playerName);

      const updated: X01AllTimePlayerStats = {
        playerName,
        gameType: "x01",
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

      const record: StoredPlayerStats = {
        key,
        gameType: "x01",
        playerName,
        data: updated as unknown as Record<string, unknown>,
      };

      try {
        await this.db.put(STATS_STORE, record);
        runInAction(() => {
          this.allTimeStats.set(key, record);
        });
      } catch {
        console.error(`Failed to save statistics for ${playerName}`);
      }
    }
  }

  /** Get all-time stats for a player in a specific game type */
  getPlayerStats(gameType: string, playerName: string): Record<string, unknown> | null {
    const key = makeKey(gameType, playerName);
    const record = this.allTimeStats.get(key);
    return record ? record.data : null;
  }

  /** Reset all statistics for a specific player in a specific game type */
  async resetPlayerStats(gameType: string, playerName: string): Promise<boolean> {
    if (!this.db) return false;

    const key = makeKey(gameType, playerName);
    try {
      await this.db.delete(STATS_STORE, key);
      runInAction(() => {
        this.allTimeStats.delete(key);
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
