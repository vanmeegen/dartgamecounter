/**
 * X01ConfigView - game-specific configuration for X01 (301/501)
 */

import type { JSX } from "react";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import type { GameConfigComponentProps } from "../types";
import type { X01Config, X01Variant, OutRule } from "./types";

export function X01ConfigView({
  config,
  onConfigChange,
}: GameConfigComponentProps<X01Config>): JSX.Element {
  const handleVariantChange = (
    _: React.MouseEvent<HTMLElement>,
    value: X01Variant | null
  ): void => {
    if (value !== null) {
      onConfigChange({ ...config, variant: value });
    }
  };

  const handleOutRuleChange = (_: React.MouseEvent<HTMLElement>, value: OutRule | null): void => {
    if (value !== null) {
      onConfigChange({ ...config, outRule: value });
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
        Game Variant
      </Typography>
      <ToggleButtonGroup
        value={config.variant}
        exclusive
        onChange={handleVariantChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value={301}>301</ToggleButton>
        <ToggleButton value={501}>501</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="h6" gutterBottom>
        Out Rule
      </Typography>
      <ToggleButtonGroup
        value={config.outRule}
        exclusive
        onChange={handleOutRuleChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="single">Single Out</ToggleButton>
        <ToggleButton value="double">Double Out</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="h6" gutterBottom>
        Legs (First to)
      </Typography>
      <ToggleButtonGroup value={config.legs} exclusive onChange={handleLegsChange} fullWidth>
        <ToggleButton value={1}>1</ToggleButton>
        <ToggleButton value={2}>2</ToggleButton>
        <ToggleButton value={3}>3</ToggleButton>
        <ToggleButton value={5}>5</ToggleButton>
        <ToggleButton value={7}>7</ToggleButton>
      </ToggleButtonGroup>
    </Paper>
  );
}
