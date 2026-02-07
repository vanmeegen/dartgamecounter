/**
 * X01PresentationModel - presentation logic extracted from X01PlayView and X01ScoreDisplay.
 * Contains pure functions for deriving display data from game state.
 */

import type { Player } from "../../types";
import type { X01Game } from "./X01Game";
import type { X01PlayerStats, X01AllTimePlayerStats } from "./types";
import { calculateX01PlayerStats } from "./statistics";

/**
 * Find the player who won the current leg (score === 0).
 */
export function getLegWinner(game: X01Game): Player | null {
  const winningPlayer = game.state.players.find((ps) => ps.score === 0);
  if (winningPlayer) {
    return game.players.find((p) => p.id === winningPlayer.playerId) ?? null;
  }
  return null;
}

/**
 * Compute current game statistics for all players.
 */
export function computeCurrentGameStats(game: X01Game): Map<string, X01PlayerStats> {
  const completedLegs = game.getAllCompletedLegs();
  const statsMap = new Map<string, X01PlayerStats>();
  for (const player of game.players) {
    statsMap.set(
      player.name,
      calculateX01PlayerStats(player.id, completedLegs, game.config.variant)
    );
  }
  return statsMap;
}

/**
 * Get all-time stats for all players from the statistics store.
 */
export function getAllTimeStats(
  game: X01Game,
  getPlayerStats: (gameType: string, playerName: string) => Record<string, unknown> | null
): Map<string, X01AllTimePlayerStats | null> {
  const statsMap = new Map<string, X01AllTimePlayerStats | null>();
  for (const player of game.players) {
    statsMap.set(player.name, getPlayerStats("x01", player.name) as X01AllTimePlayerStats | null);
  }
  return statsMap;
}

/**
 * Format an average score for display.
 * Returns "-" for zero, integer for whole numbers, 1 decimal otherwise.
 */
export function formatAverage(avg: number): string {
  if (avg === 0) return "-";
  return avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(1);
}

/**
 * Format a number for statistics display (German locale uses comma as decimal separator).
 */
export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(".", ",");
}
