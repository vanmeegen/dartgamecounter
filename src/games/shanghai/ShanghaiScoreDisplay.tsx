/**
 * ShanghaiScoreDisplay - shows round info and scores
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import type { ShanghaiGame } from "./ShanghaiGame";

interface Props {
  game: ShanghaiGame;
}

export const ShanghaiScoreDisplay = observer(function ShanghaiScoreDisplay({
  game,
}: Props): JSX.Element {
  const currentPlayerId = game.getCurrentPlayer().id;

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      {/* Round info */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          mb: 0.5,
          alignItems: "center",
        }}
      >
        <Chip
          label={`Round ${game.getCurrentRound()} / ${game.config.rounds}`}
          size="small"
          color="primary"
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Target: {game.getCurrentTargetNumber()}
        </Typography>
      </Box>

      {/* Player scores */}
      {game.players.map((player) => {
        const isActive = player.id === currentPlayerId;
        return (
          <Box
            key={player.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.5,
              px: 1,
              bgcolor: isActive ? "action.selected" : "transparent",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: isActive ? 700 : 400, fontSize: "0.85rem" }}
            >
              {player.name}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              {game.getPlayerScore(player.id)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
});
