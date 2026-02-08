/**
 * WinnerDialog - generic winner announcement dialog.
 * Game-specific statistics are passed as children.
 */

import type { JSX, ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsIcon from "@mui/icons-material/Sports";
import type { Player } from "../../../types";

interface WinnerDialogProps {
  open: boolean;
  winner: Player | null;
  isMatchWinner: boolean;
  currentLeg?: number;
  onNextLeg?: () => void;
  onNewGame: () => void;
  /** Game-specific statistics content */
  children?: ReactNode;
}

export function WinnerDialog({
  open,
  winner,
  isMatchWinner,
  currentLeg,
  onNextLeg,
  onNewGame,
  children,
}: WinnerDialogProps): JSX.Element {
  const Icon = isMatchWinner ? EmojiEventsIcon : SportsIcon;
  const title = isMatchWinner ? "Match Winner!" : `Leg ${currentLeg} Winner!`;
  const subtitle = isMatchWinner ? "Congratulations on winning the match!" : "Great checkout!";

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
            background: "linear-gradient(135deg, rgba(0,230,118,0.18) 0%, rgba(0,188,212,0.12) 100%)",
            border: "1px solid rgba(0,230,118,0.25)",
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

        {children}
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
