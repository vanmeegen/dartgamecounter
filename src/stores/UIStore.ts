/**
 * UIStore - manages UI state (current view, input method, dialogs, PWA install)
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { AppView, InputMethod } from "../types";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export class UIStore {
  currentView: AppView = "player-setup";
  inputMethod: InputMethod = "buttons";
  showWinnerDialog = false;

  // PWA install prompt
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  canInstall = false;
  isInstalled = false;

  constructor() {
    makeAutoObservable(this, {
      setupInstallPrompt: false,
    });
    this.checkIfInstalled();
  }

  private checkIfInstalled(): void {
    // Check if running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    this.isInstalled = isStandalone;
  }

  setupInstallPrompt(): void {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      runInAction(() => {
        this.installPromptEvent = e as BeforeInstallPromptEvent;
        this.canInstall = true;
      });
    });

    window.addEventListener("appinstalled", () => {
      runInAction(() => {
        this.canInstall = false;
        this.isInstalled = true;
        this.installPromptEvent = null;
      });
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) return false;

    await this.installPromptEvent.prompt();
    const { outcome } = await this.installPromptEvent.userChoice;

    runInAction(() => {
      if (outcome === "accepted") {
        this.canInstall = false;
        this.installPromptEvent = null;
      }
    });

    return outcome === "accepted";
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
