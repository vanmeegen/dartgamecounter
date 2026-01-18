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
    <Box sx={{ px: 2, pb: 2 }}>
      {/* Current player - large display */}
      <Paper
        sx={{
          p: 2,
          mb: 1,
          textAlign: "center",
          bgcolor: "primary.dark",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {currentPlayer.name}
        </Typography>
        <Typography
          variant="h1"
          sx={{
            fontSize: "4rem",
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
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {otherPlayers.map((player) => (
            <Paper
              key={player.id}
              sx={{
                flex: 1,
                minWidth: 80,
                p: 1,
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="caption" color="text.secondary" noWrap>
                {player.name}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {game.getPlayerScore(player.id)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
});
