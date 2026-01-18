/**
 * Player type definitions
 */

export interface Player {
  id: string;
  name: string;
}

export interface PlayerScore {
  playerId: string;
  score: number;
  legsWon: number;
}
