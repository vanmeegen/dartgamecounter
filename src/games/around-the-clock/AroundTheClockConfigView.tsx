/**
 * AroundTheClockConfigView - configuration for Around the Clock
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { GameConfigComponentProps } from "../types";
import type { AroundTheClockConfig } from "./types";

export function AroundTheClockConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<AroundTheClockConfig>): JSX.Element {
  const handleLegsChange = (_: React.MouseEvent<HTMLElement>, value: number | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, legs: value });
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <FormControlLabel
        control={
          <Switch
            checked={config.includesBull}
            onChange={(e) => onConfigChange({ ...config, includesBull: e.target.checked })}
          />
        }
        label="Include Bull as final target"
        sx={{ mb: 2, display: "block" }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={config.doublesAdvanceExtra}
            onChange={(e) =>
              onConfigChange({
                ...config,
                doublesAdvanceExtra: e.target.checked,
              })
            }
          />
        }
        label="Doubles advance 2, Triples advance 3"
        sx={{ mb: 3, display: "block" }}
      />

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
