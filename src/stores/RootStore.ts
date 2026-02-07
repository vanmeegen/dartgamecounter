/**
 * RootStore - orchestrates all stores
 */

import { PlayerSetupStore } from "./PlayerSetupStore";
import { GameStore } from "./GameStore";
import { UIStore } from "./UIStore";
import { PresetStore } from "./PresetStore";
import { StatisticsStore } from "./StatisticsStore";
import { isGamePreset, type Preset } from "../types";

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
      // Full game preset - configure and start game
      this.gameStore.setVariant(preset.gameConfig.variant);
      this.gameStore.setOutRule(preset.gameConfig.outRule);
      this.gameStore.setLegs(preset.gameConfig.legs);
      this.startNewGame();
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
   * Save current setup as a full game preset
   */
  async saveCurrentAsGamePreset(name: string): Promise<boolean> {
    const playerNames = this.playerSetupStore.players.map((p) => p.name);
    const gameConfig = this.gameStore.config;
    const preset = await this.presetStore.saveGamePreset(name, playerNames, gameConfig);
    return preset !== null;
  }
}
