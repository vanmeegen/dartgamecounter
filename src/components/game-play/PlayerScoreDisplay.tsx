/**
 * PlayerScoreDisplay - shows player scores (current player large, others small)
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import type { X01Game } from "../../games";

interface PlayerScoreDisplayProps {
  game: X01Game;
}

export const PlayerScoreDisplay = observer(function PlayerScoreDisplay({
  game,
}: PlayerScoreDisplayProps): JSX.Element {
  const currentPlayer = game.getCurrentPlayer();
  const currentScore = game.getPlayerScore(currentPlayer.id);
  const otherPlayers = game.players.filter((p) => p.id !== currentPlayer.id);

  return (
    <Box sx={{ px: 1, pb: 1, pt: 0.5 }}>
      {/* Current player - large display */}
      <Paper
        sx={{
          py: 1,
          px: 2,
          mb: 0.5,
          textAlign: "center",
          bgcolor: "primary.dark",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {currentPlayer.name}
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem" },
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {currentScore}
        </Typography>
      </Paper>

      {/* Other players - smaller display */}
      {otherPlayers.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          {otherPlayers.map((player) => (
            <Paper
              key={player.id}
              sx={{
                flex: 1,
                minWidth: 70,
                py: 0.5,
                px: 1,
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ fontSize: "0.65rem" }}
              >
                {player.name}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {game.getPlayerScore(player.id)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
});
