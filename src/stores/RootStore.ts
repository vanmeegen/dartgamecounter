/**
 * RootStore - orchestrates all stores
 */

import { PlayerSetupStore } from "./PlayerSetupStore";
import { GameStore } from "./GameStore";
import { UIStore } from "./UIStore";

export class RootStore {
  playerSetupStore: PlayerSetupStore;
  gameStore: GameStore;
  uiStore: UIStore;

  constructor() {
    this.playerSetupStore = new PlayerSetupStore();
    this.gameStore = new GameStore();
    this.uiStore = new UIStore();
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
}
