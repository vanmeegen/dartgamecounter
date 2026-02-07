/**
 * CricketConfigView - game-specific configuration for Cricket
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import type { GameConfigComponentProps } from "../types";
import type { CricketConfig } from "./types";

export function CricketConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<CricketConfig>): JSX.Element {
  const handleLegsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, legs: value });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Legs (First to)
      </Typography>
      <ToggleButtonGroup value={config.legs} exclusive onChange={handleLegsChange} fullWidth>
        <ToggleButton value={1}>1</ToggleButton>
        <ToggleButton value={2}>2</ToggleButton>
        <ToggleButton value={3}>3</ToggleButton>
        <ToggleButton value={5}>5</ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
