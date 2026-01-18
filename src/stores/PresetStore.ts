/**
 * PresetStore - manages presets and remembered players with IndexedDB persistence
 */

import { makeAutoObservable, runInAction } from "mobx";
import { openDB, type IDBPDatabase } from "idb";
import type { PlayerPreset, GamePreset, Preset, X01Config } from "../types";

const DB_NAME = "dartgamecounter";
const DB_VERSION = 2;
const PRESET_STORE = "presets";
const PLAYERS_STORE = "rememberedPlayers";

export class PresetStore {
  presets: Preset[] = [];
  rememberedPlayers: string[] = [];
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
          if (!db.objectStoreNames.contains(PRESET_STORE)) {
            db.createObjectStore(PRESET_STORE, { keyPath: "id" });
          }
          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains(PLAYERS_STORE)) {
              db.createObjectStore(PLAYERS_STORE, { keyPath: "name" });
            }
          }
        },
      });
      await this.loadData();
    } catch {
      console.error("Failed to initialize IndexedDB");
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private async loadData(): Promise<void> {
    if (!this.db) return;

    try {
      const [presets, players] = await Promise.all([
        this.db.getAll(PRESET_STORE),
        this.db.getAll(PLAYERS_STORE),
      ]);
      runInAction(() => {
        this.presets = presets;
        this.rememberedPlayers = players.map((p: { name: string }) => p.name).sort();
        this.isLoading = false;
      });
    } catch {
      console.error("Failed to load data");
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /** Save a player-only preset */
  async savePlayerPreset(name: string, playerNames: string[]): Promise<PlayerPreset | null> {
    if (!this.db || playerNames.length === 0) return null;

    const preset: PlayerPreset = {
      id: crypto.randomUUID(),
      name,
      playerNames,
      createdAt: Date.now(),
    };

    try {
      await this.db.put(PRESET_STORE, preset);
      runInAction(() => {
        this.presets.push(preset);
      });
      return preset;
    } catch {
      console.error("Failed to save player preset");
      return null;
    }
  }

  /** Save a full game preset */
  async saveGamePreset(
    name: string,
    playerNames: string[],
    gameConfig: X01Config
  ): Promise<GamePreset | null> {
    if (!this.db || playerNames.length === 0) return null;

    const preset: GamePreset = {
      id: crypto.randomUUID(),
      name,
      playerNames,
      gameConfig,
      createdAt: Date.now(),
    };

    try {
      await this.db.put(PRESET_STORE, preset);
      runInAction(() => {
        this.presets.push(preset);
      });
      return preset;
    } catch {
      console.error("Failed to save game preset");
      return null;
    }
  }

  /** Delete a preset */
  async deletePreset(id: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.delete(PRESET_STORE, id);
      runInAction(() => {
        this.presets = this.presets.filter((p) => p.id !== id);
      });
      return true;
    } catch {
      console.error("Failed to delete preset");
      return false;
    }
  }

  /** Get presets sorted by creation date (newest first) */
  get sortedPresets(): Preset[] {
    return [...this.presets].sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Get presets in random order (for S15 - one-click game start) */
  get randomizedPresets(): Preset[] {
    return [...this.presets].sort(() => Math.random() - 0.5);
  }

  // ========== Remembered Players ==========

  /** Add a player name to remembered list (if not already present) */
  async rememberPlayer(name: string): Promise<boolean> {
    if (!this.db) return false;
    const trimmedName = name.trim();
    if (!trimmedName || this.rememberedPlayers.includes(trimmedName)) return false;

    try {
      await this.db.put(PLAYERS_STORE, { name: trimmedName });
      runInAction(() => {
        this.rememberedPlayers = [...this.rememberedPlayers, trimmedName].sort();
      });
      return true;
    } catch {
      console.error("Failed to remember player");
      return false;
    }
  }

  /** Add multiple player names at once */
  async rememberPlayers(names: string[]): Promise<void> {
    for (const name of names) {
      await this.rememberPlayer(name);
    }
  }

  /** Update a remembered player name */
  async updateRememberedPlayer(oldName: string, newName: string): Promise<boolean> {
    if (!this.db) return false;
    const trimmedNew = newName.trim();
    if (!trimmedNew || (trimmedNew !== oldName && this.rememberedPlayers.includes(trimmedNew))) {
      return false;
    }

    try {
      await this.db.delete(PLAYERS_STORE, oldName);
      await this.db.put(PLAYERS_STORE, { name: trimmedNew });
      runInAction(() => {
        this.rememberedPlayers = this.rememberedPlayers
          .filter((p) => p !== oldName)
          .concat(trimmedNew)
          .sort();
      });
      return true;
    } catch {
      console.error("Failed to update remembered player");
      return false;
    }
  }

  /** Remove a player from remembered list */
  async forgetPlayer(name: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      await this.db.delete(PLAYERS_STORE, name);
      runInAction(() => {
        this.rememberedPlayers = this.rememberedPlayers.filter((p) => p !== name);
      });
      return true;
    } catch {
      console.error("Failed to forget player");
      return false;
    }
  }
}
