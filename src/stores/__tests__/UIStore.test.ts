import { describe, expect, test, beforeEach } from "bun:test";
import { UIStore } from "../UIStore";

describe("UIStore", () => {
  let store: UIStore;

  beforeEach(() => {
    store = new UIStore();
  });

  describe("initial state", () => {
    test("starts on player-setup view", () => {
      expect(store.currentView).toBe("player-setup");
    });

    test("starts with buttons input method", () => {
      expect(store.inputMethod).toBe("buttons");
    });
  });

  describe("navigation", () => {
    test("goToPlayerSetup sets view", () => {
      store.goToGameConfig();
      store.goToPlayerSetup();
      expect(store.currentView).toBe("player-setup");
    });

    test("goToGameConfig sets view", () => {
      store.goToGameConfig();
      expect(store.currentView).toBe("game-config");
    });

    test("goToGamePlay sets view", () => {
      store.goToGamePlay();
      expect(store.currentView).toBe("game-play");
    });
  });

  describe("input method", () => {
    test("toggleInputMethod switches between buttons and dartboard", () => {
      expect(store.inputMethod).toBe("buttons");
      store.toggleInputMethod();
      expect(store.inputMethod).toBe("dartboard");
      store.toggleInputMethod();
      expect(store.inputMethod).toBe("buttons");
    });

    test("setInputMethod sets specific method", () => {
      store.setInputMethod("dartboard");
      expect(store.inputMethod).toBe("dartboard");
    });
  });

  describe("winner dialog", () => {
    test("openWinnerDialog shows dialog", () => {
      expect(store.showWinnerDialog).toBe(false);
      store.openWinnerDialog();
      expect(store.showWinnerDialog).toBe(true);
    });

    test("closeWinnerDialog hides dialog", () => {
      store.openWinnerDialog();
      store.closeWinnerDialog();
      expect(store.showWinnerDialog).toBe(false);
    });
  });

  describe("reset", () => {
    test("resets to initial state", () => {
      store.goToGamePlay();
      store.setInputMethod("dartboard");
      store.openWinnerDialog();
      store.reset();
      expect(store.currentView).toBe("player-setup");
      expect(store.inputMethod).toBe("buttons");
      expect(store.showWinnerDialog).toBe(false);
    });
  });
});
