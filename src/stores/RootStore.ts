/**
 * RootStore - orchestrates all stores
 */

import { PlayerSetupStore } from "./PlayerSetupStore";
import { GameStore } from "./GameStore";
import { UIStore } from "./UIStore";
import { PresetStore } from "./PresetStore";
import { StatisticsStore } from "./StatisticsStore";
import { isGamePreset, type Preset } from "../types";
import { gameRegistry } from "../games/registry";

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export class RootStore {
  playerSetupStore: PlayerSetupStore;
  gameStore: GameStore;
  uiStore: UIStore;
  presetStore: PresetStore;
  statisticsStore: StatisticsStore;

  constructor() {
    this.playerSetupStore = new PlayerSetupStore();
    this.gameStore = new GameStore();
    this.uiStore = new UIStore();
    this.presetStore = new PresetStore();
    this.statisticsStore = new StatisticsStore();
  }

  /**
   * Start a new game with the current player list and config
   */
  startNewGame(): void {
    const players = this.playerSetupStore.players;
    if (players.length === 0) return;

    this.gameStore.startGame(players);
    this.uiStore.goToGamePlay();
  }

  /**
   * End the current game and return to player setup
   */
  endGameAndReset(): void {
    this.gameStore.endGame();
    this.uiStore.goToPlayerSetup();
  }

  /**
   * Reset everything to initial state
   */
  reset(): void {
    this.playerSetupStore.reset();
    this.gameStore.reset();
    this.uiStore.reset();
  }

  /**
   * Load a preset - either player names only or full game config
   * Player order is randomized for fair starting position
   */
  loadPreset(preset: Preset): void {
    // Randomize player order for fair game starts
    const shuffledNames = shuffleArray(preset.playerNames);

    // Set up players from preset
    this.playerSetupStore.reset();
    shuffledNames.forEach((name) => {
      this.playerSetupStore.addPlayer(name);
    });

    if (isGamePreset(preset)) {
      // Full game preset - select game type, configure and start
      const gameType = preset.gameType;
      if (gameRegistry.has(gameType)) {
        this.gameStore.selectGame(gameType);
        this.gameStore.updateConfig(preset.gameConfig);
        this.startNewGame();
      } else {
        // Unknown game type - just go to config
        this.uiStore.goToGameConfig();
      }
    } else {
      // Player-only preset - go to game config
      this.uiStore.goToGameConfig();
    }
  }

  /**
   * Save current setup as a player preset
   */
  async saveCurrentAsPlayerPreset(name: string): Promise<boolean> {
    const playerNames = this.playerSetupStore.players.map((p) => p.name);
    const preset = await this.presetStore.savePlayerPreset(name, playerNames);
    return preset !== null;
  }

  /**
   * Save current setup as a full game preset (game type + config)
   */
  async saveCurrentAsGamePreset(name: string): Promise<boolean> {
    const playerNames = this.playerSetupStore.players.map((p) => p.name);
    const gameType = this.gameStore.selectedGameId;
    const gameConfig = this.gameStore.gameConfig;

    if (!gameType || !gameConfig) return false;

    const preset = await this.presetStore.saveGamePreset(
      name,
      playerNames,
      gameType,
      gameConfig as Record<string, unknown>
    );
    return preset !== null;
  }
}
