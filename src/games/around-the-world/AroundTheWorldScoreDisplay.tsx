/**
 * AroundTheWorldScoreDisplay - shows target progress for each player
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import type { AroundTheWorldGame } from "./AroundTheWorldGame";
import { ATW_SEQUENCE } from "./types";

interface Props {
  game: AroundTheWorldGame;
}

export const AroundTheWorldScoreDisplay = observer(function AroundTheWorldScoreDisplay({
  game,
}: Props): JSX.Element {
  const currentPlayerId = game.getCurrentPlayer().id;

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      {game.players.map((player) => {
        const target = game.getPlayerTarget(player.id);
        const progress = game.getPlayerScore(player.id);
        const isActive = player.id === currentPlayerId;

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
                {target === 25 ? "Bull" : target === 0 ? "Done" : target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(progress / ATW_SEQUENCE.length) * 100}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        );
      })}
    </Box>
  );
});
