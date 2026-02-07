/**
 * X01Statistics - displays current game and all-time statistics for X01 games
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { X01PlayerStats, X01AllTimePlayerStats } from "./types";

interface StatsEntry {
  label: string;
  values: string[];
}

function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(".", ",");
}

function buildGameStatsRows(
  playerNames: string[],
  stats: Map<string, X01PlayerStats>
): StatsEntry[] {
  const get = (name: string): X01PlayerStats | undefined => stats.get(name);
  return [
    {
      label: "Legs gewonnen",
      values: playerNames.map((n) => {
        const s = get(n);
        return s ? `${s.legsWon} / ${s.legsPlayed}` : "-";
      }),
    },
    {
      label: "Darts gesamt",
      values: playerNames.map((n) => get(n)?.totalDarts.toString() ?? "-"),
    },
    {
      label: "Darts/Leg",
      values: playerNames.map((n) => {
        const s = get(n);
        return s?.dartsPerLeg !== null && s?.dartsPerLeg !== undefined
          ? formatNumber(s.dartsPerLeg, 1)
          : "-";
      }),
    },
    {
      label: "Average \u00D8",
      values: playerNames.map((n) => {
        const s = get(n);
        return s ? formatNumber(s.average, 2) : "-";
      }),
    },
    {
      label: "Best Visit",
      values: playerNames.map((n) => get(n)?.highestVisit.toString() ?? "-"),
    },
    {
      label: "Best Leg",
      values: playerNames.map((n) => {
        const s = get(n);
        return s?.bestLeg !== null && s?.bestLeg !== undefined ? `${s.bestLeg} Darts` : "-";
      }),
    },
    {
      label: "60+",
      values: playerNames.map((n) => get(n)?.visits60Plus.toString() ?? "-"),
    },
    {
      label: "100+",
      values: playerNames.map((n) => get(n)?.visits100Plus.toString() ?? "-"),
    },
    {
      label: "140+",
      values: playerNames.map((n) => get(n)?.visits140Plus.toString() ?? "-"),
    },
    {
      label: "180",
      values: playerNames.map((n) => get(n)?.visits180.toString() ?? "-"),
    },
  ];
}

function buildAllTimeStatsRows(
  playerNames: string[],
  stats: Map<string, X01AllTimePlayerStats | null>
): StatsEntry[] {
  const get = (name: string): X01AllTimePlayerStats | null | undefined => stats.get(name);
  return [
    {
      label: "Spiele",
      values: playerNames.map((n) => {
        const s = get(n);
        return s ? `${s.gamesWon} / ${s.gamesPlayed}` : "-";
      }),
    },
    {
      label: "Legs",
      values: playerNames.map((n) => {
        const s = get(n);
        return s ? `${s.legsWon} / ${s.legsPlayed}` : "-";
      }),
    },
    {
      label: "Darts gesamt",
      values: playerNames.map((n) => get(n)?.totalDarts.toString() ?? "-"),
    },
    {
      label: "Average \u00D8",
      values: playerNames.map((n) => {
        const s = get(n);
        if (!s || s.totalDarts === 0) return "-";
        return formatNumber((s.totalPointsScored / s.totalDarts) * 3, 2);
      }),
    },
    {
      label: "Darts/Leg",
      values: playerNames.map((n) => {
        const s = get(n);
        if (!s || s.wonLegCount === 0) return "-";
        return formatNumber(s.totalDartsInWonLegs / s.wonLegCount, 1);
      }),
    },
    {
      label: "Best Visit",
      values: playerNames.map((n) => get(n)?.highestVisit.toString() ?? "-"),
    },
    {
      label: "Best Leg",
      values: playerNames.map((n) => {
        const s = get(n);
        return s?.bestLeg !== null && s?.bestLeg !== undefined ? `${s.bestLeg} Darts` : "-";
      }),
    },
    {
      label: "60+",
      values: playerNames.map((n) => get(n)?.visits60Plus.toString() ?? "-"),
    },
    {
      label: "100+",
      values: playerNames.map((n) => get(n)?.visits100Plus.toString() ?? "-"),
    },
    {
      label: "140+",
      values: playerNames.map((n) => get(n)?.visits140Plus.toString() ?? "-"),
    },
    {
      label: "180",
      values: playerNames.map((n) => get(n)?.visits180.toString() ?? "-"),
    },
  ];
}

function StatsTable({
  title,
  playerNames,
  rows,
}: {
  title: string;
  playerNames: string[];
  rows: StatsEntry[];
}): JSX.Element {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.8rem" }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ "& td, & th": { px: 0.5, py: 0.25, fontSize: "0.75rem" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}></TableCell>
              {playerNames.map((name) => (
                <TableCell key={name} align="center" sx={{ fontWeight: 600 }}>
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                  {row.label}
                </TableCell>
                {row.values.map((value, i) => (
                  <TableCell key={i} align="center">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

interface X01StatisticsProps {
  playerNames: string[];
  currentGameStats: Map<string, X01PlayerStats>;
  allTimeStats: Map<string, X01AllTimePlayerStats | null>;
}

export const X01Statistics = observer(function X01Statistics({
  playerNames,
  currentGameStats,
  allTimeStats,
}: X01StatisticsProps): JSX.Element {
  const gameRows = buildGameStatsRows(playerNames, currentGameStats);
  const allTimeRows = buildAllTimeStatsRows(playerNames, allTimeStats);

  return (
    <Box sx={{ mt: 1 }}>
      <StatsTable title="Aktuelles Spiel" playerNames={playerNames} rows={gameRows} />
      <StatsTable title="Gesamt-Statistik" playerNames={playerNames} rows={allTimeRows} />
    </Box>
  );
});
