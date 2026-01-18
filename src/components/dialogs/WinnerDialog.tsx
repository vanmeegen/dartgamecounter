/**
 * WinnerDialog - displays winner with celebration
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
import type { Player } from "../../types";

interface WinnerDialogProps {
  open: boolean;
  winner: Player | null;
  onClose: () => void;
}

export function WinnerDialog({ open, winner, onClose }: WinnerDialogProps): JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: "secondary.main" }} />
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Winner!
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
          Congratulations on the checkout!
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button variant="contained" size="large" onClick={onClose} autoFocus>
          New Game
        </Button>
      </DialogActions>
    </Dialog>
  );
}
