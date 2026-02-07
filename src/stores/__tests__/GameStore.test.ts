import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { GameStore } from "../GameStore";
import type { Player } from "../../types";
import { gameRegistry } from "../../games/registry";
import { X01Game } from "../../games/x01/X01Game";
import type { X01Config } from "../../games/x01/types";

describe("GameStore", () => {
  let store: GameStore;
  const players: Player[] = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ];

  beforeEach(() => {
    gameRegistry.register<X01Config>({
      id: "x01",
      name: "X01",
      description: "Classic countdown (301/501)",
      minPlayers: 1,
      maxPlayers: 8,
      defaultConfig: { variant: 501, outRule: "double", legs: 1 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ConfigComponent: (() => null) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      PlayComponent: (() => null) as any,
      createGame: (p, config) => new X01Game(p, config as X01Config),
    });
    store = new GameStore();
  });

  afterEach(() => {
    gameRegistry.unregister("x01");
  });

  describe("game selection", () => {
    test("has no game selected initially", () => {
      expect(store.selectedGameId).toBeNull();
      expect(store.gameConfig).toBeNull();
    });

    test("selectGame sets game id and default config", () => {
      store.selectGame("x01");
      expect(store.selectedGameId).toBe("x01");
      expect(store.gameConfig).toEqual({ variant: 501, outRule: "double", legs: 1 });
    });

    test("selectGame ignores unknown game types", () => {
      store.selectGame("unknown-game");
      expect(store.selectedGameId).toBeNull();
      expect(store.gameConfig).toBeNull();
    });

    test("updateConfig replaces the config", () => {
      store.selectGame("x01");
      store.updateConfig({ variant: 301, outRule: "single", legs: 3 });
      expect(store.gameConfig).toEqual({ variant: 301, outRule: "single", legs: 3 });
    });
  });

  describe("startGame", () => {
    test("creates a new game instance", () => {
      store.selectGame("x01");
      expect(store.currentGame).toBeNull();
      store.startGame(players);
      expect(store.currentGame).not.toBeNull();
    });

    test("does not start with empty players", () => {
      store.selectGame("x01");
      store.startGame([]);
      expect(store.currentGame).toBeNull();
    });

    test("does not start without selecting a game", () => {
      store.startGame(players);
      expect(store.currentGame).toBeNull();
    });

    test("initializes game with current config", () => {
      store.selectGame("x01");
      store.updateConfig({ variant: 301, outRule: "single", legs: 1 });
      store.startGame(players);
      expect(store.currentGame).not.toBeNull();
      expect((store.currentGame as unknown as X01Game).config.variant).toBe(301);
      expect((store.currentGame as unknown as X01Game).config.outRule).toBe("single");
    });
  });

  describe("game state", () => {
    test("isGameActive returns true when game is running", () => {
      store.selectGame("x01");
      store.startGame(players);
      expect(store.isGameActive).toBe(true);
    });

    test("isGameActive returns false when no game", () => {
      expect(store.isGameActive).toBe(false);
    });

    test("endGame clears current game", () => {
      store.selectGame("x01");
      store.startGame(players);
      store.endGame();
      expect(store.currentGame).toBeNull();
    });
  });

  describe("currentGameDefinition", () => {
    test("returns null when no game selected", () => {
      expect(store.currentGameDefinition).toBeNull();
    });

    test("returns definition when game selected", () => {
      store.selectGame("x01");
      expect(store.currentGameDefinition).not.toBeNull();
      expect(store.currentGameDefinition?.id).toBe("x01");
      expect(store.currentGameDefinition?.name).toBe("X01");
    });
  });

  describe("reset", () => {
    test("resets to default state", () => {
      store.selectGame("x01");
      store.startGame(players);
      store.reset();
      expect(store.selectedGameId).toBeNull();
      expect(store.gameConfig).toBeNull();
      expect(store.currentGame).toBeNull();
    });
  });
});
