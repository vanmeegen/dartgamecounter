/**
 * WinnerDialog - displays leg or match winner with celebration and statistics
 */

import type { JSX } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsIcon from "@mui/icons-material/Sports";
import type { Player, PlayerStats, AllTimePlayerStats } from "../../types";
import { GameStatistics } from "../game-play/GameStatistics";

interface WinnerDialogProps {
  open: boolean;
  winner: Player | null;
  isMatchWinner: boolean;
  currentLeg?: number;
  onNextLeg?: () => void;
  onNewGame: () => void;
  playerNames?: string[];
  currentGameStats?: Map<string, PlayerStats>;
  allTimeStats?: Map<string, AllTimePlayerStats | null>;
}

export function WinnerDialog({
  open,
  winner,
  isMatchWinner,
  currentLeg,
  onNextLeg,
  onNewGame,
  playerNames,
  currentGameStats,
  allTimeStats,
}: WinnerDialogProps): JSX.Element {
  const Icon = isMatchWinner ? EmojiEventsIcon : SportsIcon;
  const title = isMatchWinner ? "Match Winner!" : `Leg ${currentLeg} Winner!`;
  const subtitle = isMatchWinner ? "Congratulations on winning the match!" : "Great checkout!";
  const showStats =
    playerNames && playerNames.length > 0 && currentGameStats && currentGameStats.size > 0;

  return (
    <Dialog
      open={open}
      onClose={isMatchWinner ? onNewGame : onNextLeg}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        <Icon sx={{ fontSize: 60, color: "secondary.main" }} />
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Box
          sx={{
            py: 2,
            px: 3,
            bgcolor: "primary.dark",
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {winner?.name ?? "Unknown"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>

        {showStats && (
          <GameStatistics
            playerNames={playerNames}
            currentGameStats={currentGameStats}
            allTimeStats={allTimeStats ?? new Map()}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
        {isMatchWinner ? (
          <Button variant="contained" size="large" onClick={onNewGame} autoFocus>
            New Game
          </Button>
        ) : (
          <>
            <Button variant="outlined" size="large" onClick={onNewGame}>
              End Match
            </Button>
            <Button variant="contained" size="large" onClick={onNextLeg} autoFocus>
              Next Leg
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
