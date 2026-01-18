/**
 * PresetStore - manages presets with IndexedDB persistence
 */

import { makeAutoObservable, runInAction } from "mobx";
import { openDB, type IDBPDatabase } from "idb";
import type { PlayerPreset, GamePreset, Preset, X01Config } from "../types";

const DB_NAME = "dartgamecounter";
const DB_VERSION = 1;
const PRESET_STORE = "presets";

export class PresetStore {
  presets: Preset[] = [];
  isLoading = true;
  private db: IDBPDatabase | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initDB();
  }

  private async initDB(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(PRESET_STORE)) {
            db.createObjectStore(PRESET_STORE, { keyPath: "id" });
          }
        },
      });
      await this.loadPresets();
    } catch {
      console.error("Failed to initialize IndexedDB");
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private async loadPresets(): Promise<void> {
    if (!this.db) return;

    try {
      const presets = await this.db.getAll(PRESET_STORE);
      runInAction(() => {
        this.presets = presets;
        this.isLoading = false;
      });
    } catch {
      console.error("Failed to load presets");
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
}
