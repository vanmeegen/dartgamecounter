/**
 * Statistics calculation utilities
 */

import type { CompletedLeg, VisitRecord } from "../types/game.types";
import type { PlayerStats } from "../types/statistics.types";

/**
 * Calculate statistics for a player from a set of completed legs.
 */
export function calculatePlayerStats(
  playerId: string,
  completedLegs: CompletedLeg[],
  gameVariant: number
): PlayerStats {
  let totalDarts = 0;
  let totalPointsScored = 0;
  let highestVisit = 0;
  let bestLeg: number | null = null;
  let visits60Plus = 0;
  let visits100Plus = 0;
  let visits140Plus = 0;
  let visits180 = 0;
  let legsWon = 0;
  let totalDartsInWonLegs = 0;

  for (const leg of completedLegs) {
    const playerVisits = leg.visitHistory.filter((v) => v.playerId === playerId);
    const legDarts = countDartsInVisits(playerVisits);
    const legPoints = countPointsInVisits(playerVisits, gameVariant, leg.winnerId === playerId);

    totalDarts += legDarts;
    totalPointsScored += legPoints;

    if (leg.winnerId === playerId) {
      legsWon++;
      totalDartsInWonLegs += legDarts;
      if (bestLeg === null || legDarts < bestLeg) {
        bestLeg = legDarts;
      }
    }

    for (const record of playerVisits) {
      if (record.visit.busted) continue;
      const visitTotal = record.visit.total;
      if (visitTotal > highestVisit) highestVisit = visitTotal;
      if (visitTotal >= 180) visits180++;
      if (visitTotal >= 140) visits140Plus++;
      if (visitTotal >= 100) visits100Plus++;
      if (visitTotal >= 60) visits60Plus++;
    }
  }

  const average = totalDarts > 0 ? (totalPointsScored / totalDarts) * 3 : 0;
  const dartsPerLeg = legsWon > 0 ? totalDartsInWonLegs / legsWon : null;

  return {
    legsPlayed: completedLegs.length,
    legsWon,
    totalDarts,
    totalPointsScored,
    average,
    dartsPerLeg,
    highestVisit,
    bestLeg,
    visits60Plus,
    visits100Plus,
    visits140Plus,
    visits180,
  };
}

/**
 * Count total darts thrown in a set of visit records.
 */
function countDartsInVisits(visits: VisitRecord[]): number {
  return visits.reduce((sum, v) => sum + v.visit.darts.length, 0);
}

/**
 * Count total points scored in a set of visit records.
 * For the winning player's last visit in a won leg, use the game variant
 * minus the score after (which should be 0 for the winner).
 * For busted visits, count 0 points.
 */
function countPointsInVisits(
  visits: VisitRecord[],
  gameVariant: number,
  isLegWinner: boolean
): number {
  let total = 0;
  for (const record of visits) {
    if (record.visit.busted) continue;
    total += record.visit.total;
  }
  // For the leg winner, the total points should equal the game variant
  // For non-winners, it's the sum of their non-busted visits
  if (isLegWinner) {
    return gameVariant;
  }
  return total;
}
