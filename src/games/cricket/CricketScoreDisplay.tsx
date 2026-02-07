/**
 * CricketScoreDisplay - shows marks and points for all players
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { CricketGame } from "./CricketGame";

interface CricketScoreDisplayProps {
  game: CricketGame;
}

function formatMarks(count: number, marksToClose: number): string {
  if (count >= marksToClose) return "\u2A02"; // closed (circled X)
  if (count === 2) return "X";
  if (count === 1) return "/";
  return "";
}

export const CricketScoreDisplay = observer(function CricketScoreDisplay({
  game,
}: CricketScoreDisplayProps): JSX.Element {
  const cricketNumbers = game.getCricketNumbers();
  const currentPlayerId = game.getCurrentPlayer().id;

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      {/* Header row */}
      <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
        <Box sx={{ flex: 2 }} />
        {cricketNumbers.map((num) => (
          <Box
            key={num}
            sx={{
              flex: 1,
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {num === 25 ? "B" : num}
            </Typography>
          </Box>
        ))}
        <Box sx={{ flex: 1.5, textAlign: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Pts
          </Typography>
        </Box>
      </Box>

      {/* Player rows */}
      {game.players.map((player) => {
        const marks = game.getPlayerMarks(player.id);
        const isActive = player.id === currentPlayerId;
        return (
          <Box
            key={player.id}
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              py: 0.5,
              bgcolor: isActive ? "action.selected" : "transparent",
              borderRadius: 1,
              px: 0.5,
            }}
          >
            <Box sx={{ flex: 2, overflow: "hidden" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "0.85rem",
                }}
              >
                {player.name}
              </Typography>
            </Box>
            {cricketNumbers.map((num) => (
              <Box key={num} sx={{ flex: 1, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color:
                      (marks.get(num) ?? 0) >= game.config.marksToClose
                        ? "success.main"
                        : "text.primary",
                  }}
                >
                  {formatMarks(marks.get(num) ?? 0, game.config.marksToClose)}
                </Typography>
              </Box>
            ))}
            <Box sx={{ flex: 1.5, textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {game.getPlayerScore(player.id)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
});
