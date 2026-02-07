/**
 * AroundTheWorldConfigView - configuration for Around the World
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import type { GameConfigComponentProps } from "../types";
import type { AroundTheWorldConfig } from "./types";

export function AroundTheWorldConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<AroundTheWorldConfig>): JSX.Element {
  const handleLegsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, legs: value });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Hit 1-20 then Bull. Doubles skip a number, triples skip two.
      </Typography>
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
