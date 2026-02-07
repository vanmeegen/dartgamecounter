/**
 * AroundTheClockScoreDisplay - shows target progress for each player
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import type { AroundTheClockGame } from "./AroundTheClockGame";

interface Props {
  game: AroundTheClockGame;
}

export const AroundTheClockScoreDisplay = observer(function AroundTheClockScoreDisplay({
  game,
}: Props): JSX.Element {
  const currentPlayerId = game.getCurrentPlayer().id;
  const maxTarget = game.config.includesBull ? 21 : 20;

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      {game.players.map((player) => {
        const target = game.getPlayerTarget(player.id);
        const isActive = player.id === currentPlayerId;
        const progress = ((target - 1) / maxTarget) * 100;

        return (
          <Box
            key={player.id}
            sx={{
              py: 0.5,
              px: 1,
              mb: 0.5,
              bgcolor: isActive ? "action.selected" : "transparent",
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.25,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: isActive ? 700 : 400, fontSize: "0.85rem" }}
              >
                {player.name}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                {target > 20 ? "Bull" : target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        );
      })}
    </Box>
  );
});
