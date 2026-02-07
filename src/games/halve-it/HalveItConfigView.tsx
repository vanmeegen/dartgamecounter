/**
 * HalveItConfigView - configuration for Halve It
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import type { GameConfigComponentProps } from "../types";
import type { HalveItConfig } from "./types";

export function HalveItConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<HalveItConfig>): JSX.Element {
  const handleStartingScoreChange = (
    _: React.MouseEvent<HTMLElement>,
    value: number | null
  ): void => {
    if (value !== null) {
      onConfigChange({ ...config, startingScore: value });
    }
  };

  const handleLegsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, legs: value });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Rounds: {config.targets.map((t) => t.label).join(" \u2192 ")}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Starting Score
      </Typography>
      <ToggleButtonGroup
        value={config.startingScore}
        exclusive
        onChange={handleStartingScoreChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value={0}>0</ToggleButton>
        <ToggleButton value={20}>20</ToggleButton>
        <ToggleButton value={40}>40</ToggleButton>
        <ToggleButton value={100}>100</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="h6" gutterBottom>
        Legs (First to)
      </Typography>
      <ToggleButtonGroup value={config.legs} exclusive onChange={handleLegsChange} fullWidth>
        <ToggleButton value={1}>1</ToggleButton>
        <ToggleButton value={2}>2</ToggleButton>
        <ToggleButton value={3}>3</ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
