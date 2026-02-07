/**
 * ShanghaiConfigView - configuration for Shanghai
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import type { GameConfigComponentProps } from "../types";
import type { ShanghaiConfig } from "./types";

export function ShanghaiConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<ShanghaiConfig>): JSX.Element {
  const handleRoundsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, rounds: value });
    }
  };

  const handleStartChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, startNumber: value });
    }
  };

  const handleLegsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, legs: value });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Number of Rounds
      </Typography>
      <ToggleButtonGroup
        value={config.rounds}
        exclusive
        onChange={handleRoundsChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value={7}>7</ToggleButton>
        <ToggleButton value={10}>10</ToggleButton>
        <ToggleButton value={20}>20</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="h6" gutterBottom>
        Starting Number
      </Typography>
      <ToggleButtonGroup
        value={config.startNumber}
        exclusive
        onChange={handleStartChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value={1}>1</ToggleButton>
        <ToggleButton value={5}>5</ToggleButton>
        <ToggleButton value={10}>10</ToggleButton>
        <ToggleButton value={15}>15</ToggleButton>
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
