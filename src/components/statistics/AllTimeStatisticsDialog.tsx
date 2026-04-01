/**
 * AllTimeStatisticsDialog - shows cumulated all-time statistics per player.
 * Accessible from the player setup screen after games have been played.
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useStatisticsStore } from "../../hooks/useStores";
import type { X01AllTimePlayerStats } from "../../games/x01/types";
import { formatNumber } from "../../games/x01/X01PresentationModel";

interface AllTimeStatisticsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface StatRow {
  label: string;
  value: string;
}

function buildPlayerStatsRows(stats: X01AllTimePlayerStats): StatRow[] {
  const avg =
    stats.totalDarts > 0 ? formatNumber((stats.totalPointsScored / stats.totalDarts) * 3, 2) : "-";
  const dartsPerLeg =
    stats.wonLegCount > 0 ? formatNumber(stats.totalDartsInWonLegs / stats.wonLegCount, 1) : "-";

  return [
    { label: "Spiele (gewonnen / gespielt)", value: `${stats.gamesWon} / ${stats.gamesPlayed}` },
    { label: "Legs (gewonnen / gespielt)", value: `${stats.legsWon} / ${stats.legsPlayed}` },
    { label: "Darts gesamt", value: stats.totalDarts.toString() },
    { label: "Average \u00D8", value: avg },
    { label: "Darts/Leg (gewonnen)", value: dartsPerLeg },
    { label: "Best Visit", value: stats.highestVisit > 0 ? stats.highestVisit.toString() : "-" },
    {
      label: "Best Leg",
      value: stats.bestLeg !== null ? `${stats.bestLeg} Darts` : "-",
    },
    { label: "60+", value: stats.visits60Plus.toString() },
    { label: "100+", value: stats.visits100Plus.toString() },
    { label: "140+", value: stats.visits140Plus.toString() },
    { label: "180", value: stats.visits180.toString() },
  ];
}

export const AllTimeStatisticsDialog = observer(function AllTimeStatisticsDialog({
  open,
  onClose,
}: AllTimeStatisticsDialogProps): JSX.Element {
  const statisticsStore = useStatisticsStore();
  const [selectedTab, setSelectedTab] = useState(0);

  const playerNames = statisticsStore.getPlayersWithStats("x01");

  const selectedPlayer = playerNames[selectedTab] ?? null;
  const stats = selectedPlayer
    ? (statisticsStore.getPlayerStats("x01", selectedPlayer) as X01AllTimePlayerStats | null)
    : null;

  const rows = stats ? buildPlayerStatsRows(stats) : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogTitle>Gesamt-Statistik (X01)</DialogTitle>
      <DialogContent>
        {playerNames.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Noch keine Statistiken vorhanden.
          </Typography>
        ) : (
          <>
            <Tabs
              value={selectedTab}
              onChange={(_, v) => setSelectedTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              {playerNames.map((name) => (
                <Tab key={name} label={name} />
              ))}
            </Tabs>

            {stats && (
              <Box>
                <TableContainer>
                  <Table size="small" sx={{ "& td": { px: 1, py: 0.5, fontSize: "0.85rem" } }}>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell sx={{ color: "text.secondary" }}>{row.label}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {row.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Schlie\u00DFen</Button>
      </DialogActions>
    </Dialog>
  );
});
