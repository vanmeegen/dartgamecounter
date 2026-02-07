/**
 * Additional coverage tests for UIStore - PWA install prompt methods
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { UIStore } from "../UIStore";

describe("UIStore - PWA install", () => {
  let store: UIStore;

  beforeEach(() => {
    store = new UIStore();
  });

  describe("setupInstallPrompt", () => {
    test("registers event listeners without throwing", () => {
      // Should not throw when setting up listeners
      store.setupInstallPrompt();
    });

    test("beforeinstallprompt event sets canInstall and stores event", () => {
      store.setupInstallPrompt();

      // Simulate beforeinstallprompt event
      const mockEvent = new Event("beforeinstallprompt", { cancelable: true });
      window.dispatchEvent(mockEvent);

      expect(store.canInstall).toBe(true);
    });

    test("appinstalled event sets isInstalled and clears canInstall", () => {
      store.setupInstallPrompt();

      // First trigger install prompt
      const mockPromptEvent = new Event("beforeinstallprompt", { cancelable: true });
      window.dispatchEvent(mockPromptEvent);
      expect(store.canInstall).toBe(true);

      // Then trigger app installed
      const mockInstalledEvent = new Event("appinstalled");
      window.dispatchEvent(mockInstalledEvent);

      expect(store.canInstall).toBe(false);
      expect(store.isInstalled).toBe(true);
    });
  });

  describe("promptInstall", () => {
    test("returns false when no install prompt event", async () => {
      const result = await store.promptInstall();
      expect(result).toBe(false);
    });

    test("returns true when user accepts the install prompt", async () => {
      // Inject a mock install prompt event via the private field
      const mockEvent = {
        prompt: (): Promise<void> => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: "accepted" as const }),
      };
      (store as unknown as { installPromptEvent: unknown }).installPromptEvent = mockEvent;
      store.canInstall = true;

      const result = await store.promptInstall();
      expect(result).toBe(true);
      expect(store.canInstall).toBe(false);
    });

    test("returns false when user dismisses the install prompt", async () => {
      const mockEvent = {
        prompt: (): Promise<void> => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: "dismissed" as const }),
      };
      (store as unknown as { installPromptEvent: unknown }).installPromptEvent = mockEvent;
      store.canInstall = true;

      const result = await store.promptInstall();
      expect(result).toBe(false);
      // canInstall should remain true when dismissed
      expect(store.canInstall).toBe(true);
    });
  });

  describe("setView", () => {
    test("sets arbitrary view", () => {
      store.setView("game-config");
      expect(store.currentView).toBe("game-config");
    });
  });
});
