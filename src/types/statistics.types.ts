/**
 * Generic statistics type definitions
 *
 * Game-specific stats types (X01PlayerStats, X01AllTimePlayerStats) live
 * in their respective game modules. This file defines the generic
 * storage format used by the StatisticsStore.
 */

/**
 * Generic all-time stats record stored in IndexedDB.
 * Each game type defines its own shape; this is the storage envelope.
 */
export interface StoredPlayerStats {
  /** Composite key: `${gameType}:${playerName}` */
  key: string;
  gameType: string;
  playerName: string;
  /** Game-specific stats data (shape depends on gameType) */
  data: Record<string, unknown>;
}
