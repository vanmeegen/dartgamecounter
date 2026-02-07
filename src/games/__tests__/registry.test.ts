/**
 * Tests for GameRegistry - cover duplicate registration warning
 */

import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import type { ComponentType } from "react";
import { gameRegistry } from "../registry";
import { X01Game } from "../x01/X01Game";
import type { X01Config } from "../x01/types";
import type { GameDefinition, GameConfigComponentProps, GamePlayComponentProps } from "../types";
import type { Player } from "../../types";

const StubConfig = (() => null) as ComponentType<GameConfigComponentProps<X01Config>>;
const StubPlay = (() => null) as ComponentType<GamePlayComponentProps>;

function makeX01Definition(
  overrides: Partial<{ name: string; description: string }> = {}
): GameDefinition<X01Config> {
  return {
    id: "x01",
    name: overrides.name ?? "X01",
    description: overrides.description ?? "Classic countdown (301/501)",
    minPlayers: 1,
    maxPlayers: 8,
    defaultConfig: { variant: 501, outRule: "double", legs: 1 },
    ConfigComponent: StubConfig,
    PlayComponent: StubPlay,
    createGame: (players: Player[], config: X01Config): X01Game => new X01Game(players, config),
  };
}

describe("GameRegistry", () => {
  beforeEach(() => {
    gameRegistry.register<X01Config>(makeX01Definition());
  });

  afterEach(() => {
    gameRegistry.unregister("x01");
  });

  test("re-registering an existing game type overwrites it", () => {
    const original = gameRegistry.get("x01");

    // Re-register with updated description
    gameRegistry.register<X01Config>(
      makeX01Definition({ name: "X01 Updated", description: "Updated description" })
    );

    const updated = gameRegistry.get("x01");
    expect(updated?.name).toBe("X01 Updated");

    // Restore original
    if (original) {
      gameRegistry.register(original);
    }
  });

  test("getAll returns all registered games", () => {
    const all = gameRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
    expect(all.some((g) => g.id === "x01")).toBe(true);
  });

  test("get returns undefined for unregistered game", () => {
    expect(gameRegistry.get("nonexistent")).toBeUndefined();
  });

  test("has returns false for unregistered game", () => {
    expect(gameRegistry.has("nonexistent")).toBe(false);
  });

  test("unregister removes a game", () => {
    expect(gameRegistry.has("x01")).toBe(true);
    gameRegistry.unregister("x01");
    expect(gameRegistry.has("x01")).toBe(false);
  });
});
