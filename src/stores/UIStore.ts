/**
 * UIStore - manages UI state (current view, input method, dialogs)
 */

import { makeAutoObservable } from "mobx";
import type { AppView, InputMethod } from "../types";

export class UIStore {
  currentView: AppView = "player-setup";
  inputMethod: InputMethod = "buttons";
  showWinnerDialog = false;

  constructor() {
    makeAutoObservable(this);
  }

  setView(view: AppView): void {
    this.currentView = view;
  }

  setInputMethod(method: InputMethod): void {
    this.inputMethod = method;
  }

  toggleInputMethod(): void {
    this.inputMethod = this.inputMethod === "buttons" ? "dartboard" : "buttons";
  }

  openWinnerDialog(): void {
    this.showWinnerDialog = true;
  }

  closeWinnerDialog(): void {
    this.showWinnerDialog = false;
  }

  goToPlayerSetup(): void {
    this.currentView = "player-setup";
  }

  goToGameConfig(): void {
    this.currentView = "game-config";
  }

  goToGamePlay(): void {
    this.currentView = "game-play";
  }

  reset(): void {
    this.currentView = "player-setup";
    this.inputMethod = "buttons";
    this.showWinnerDialog = false;
  }
}
