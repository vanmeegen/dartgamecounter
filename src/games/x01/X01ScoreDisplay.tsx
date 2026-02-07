/**
 * X01ScoreDisplay - shows player scores (current player large, others small)
 * with per-visit average in the lower-right corner of each badge
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import type { X01Game } from "./X01Game";

interface X01ScoreDisplayProps {
  game: X01Game;
}

function formatAverage(avg: number): string {
  if (avg === 0) return "-";
  return avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(1);
}

export const X01ScoreDisplay = observer(function X01ScoreDisplay({
  game,
}: X01ScoreDisplayProps): JSX.Element {
  const currentPlayer = game.getCurrentPlayer();
  const currentScore = game.getPlayerScore(currentPlayer.id);
  const currentAverage = game.getPlayerAverage(currentPlayer.id);
  const currentLegsWon = game.getPlayerLegsWon(currentPlayer.id);
  const otherPlayers = game.players.filter((p) => p.id !== currentPlayer.id);
  const showLegs = game.config.legs > 1;
  const legsToWin = game.getLegsToWin();

  return (
    <Box sx={{ px: 1, pb: 1, pt: 0.5 }}>
      {/* Leg indicator */}
      {showLegs && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <Chip
            label={`Leg ${game.state.currentLeg} - First to ${legsToWin}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
        </Box>
      )}

      {/* Current player - large display */}
      <Paper
        sx={{
          py: 1,
          px: 2,
          mb: 0.5,
          bgcolor: "primary.dark",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {currentPlayer.name}
          </Typography>
          {showLegs && (
            <Chip
              label={`${currentLegsWon} legs`}
              size="small"
              color="secondary"
              sx={{ fontSize: "0.65rem", height: 18 }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
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
        </Box>
        {/* Average in lower-right corner */}
        <Typography
          sx={{
            position: "absolute",
            bottom: 4,
            right: 8,
            fontSize: { xs: "0.85rem", sm: "1rem" },
            color: "text.secondary",
            lineHeight: 1,
          }}
        >
          Avg {formatAverage(currentAverage)}
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
          {otherPlayers.map((player) => {
            const playerAvg = game.getPlayerAverage(player.id);
            return (
              <Paper
                key={player.id}
                sx={{
                  flex: 1,
                  minWidth: 70,
                  py: 0.5,
                  px: 1,
                  bgcolor: "background.paper",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
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
                  {showLegs && (
                    <Typography
                      variant="caption"
                      color="secondary.main"
                      sx={{ fontSize: "0.6rem" }}
                    >
                      ({game.getPlayerLegsWon(player.id)})
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {game.getPlayerScore(player.id)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      color: "text.secondary",
                      lineHeight: 1,
                    }}
                  >
                    {formatAverage(playerAvg)}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
});
