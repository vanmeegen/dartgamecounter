/**
 * ButtonInput - number grid (1-20, 25, Bull) with modifiers (D, T) and Miss/Undo
 *
 * Layout:
 * - Top row: D, T, Undo (single is implicit when no modifier active)
 * - Middle: 4x5 number grid (1-20)
 * - Bottom row: 25/Bull and Miss (sharing the row)
 */

import { useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import type { Multiplier } from "../../../types";
import {
  toggleModifier as toggleMod,
  getBullThrow,
  formatButtonLabel,
  getBullButtonText,
} from "./ButtonInputModel";

interface ButtonInputProps {
  onThrow: (segment: number, multiplier: Multiplier) => void;
  onUndo: () => void;
}

/** Shared sx for modifier/action buttons in the top row */
const modifierButtonSx = {
  flex: 1,
  minWidth: 0,
  py: 1,
  fontSize: "clamp(1rem, 4vw, 1.5rem)",
  fontWeight: 700,
} as const;

export function ButtonInput({ onThrow, onUndo }: ButtonInputProps): JSX.Element {
  const [modifier, setModifier] = useState<Multiplier>(1);

  const handleNumberClick = (segment: number): void => {
    onThrow(segment, modifier);
    setModifier(1); // Reset modifier after throw
  };

  const handleMiss = (): void => {
    onThrow(0, 1);
    setModifier(1);
  };

  const handleBull = (): void => {
    const bull = getBullThrow(modifier);
    onThrow(bull.segment, bull.multiplier);
    setModifier(1);
  };

  const handleToggleModifier = (mod: Multiplier): void => {
    setModifier(toggleMod(modifier, mod));
  };

  const numbers = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", height: "100%" }}>
      {/* Modifier row: D, T, Undo */}
      <Box sx={{ display: "flex", gap: "2px" }}>
        <Button
          variant={modifier === 2 ? "contained" : "outlined"}
          color={modifier === 2 ? "secondary" : "inherit"}
          onClick={() => handleToggleModifier(2)}
          sx={modifierButtonSx}
        >
          Double
        </Button>
        <Button
          variant={modifier === 3 ? "contained" : "outlined"}
          color={modifier === 3 ? "secondary" : "inherit"}
          onClick={() => handleToggleModifier(3)}
          sx={modifierButtonSx}
        >
          Triple
        </Button>
        <IconButton
          onClick={onUndo}
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <UndoIcon sx={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }} />
        </IconButton>
      </Box>

      {/* Number grid */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {numbers.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "flex", gap: "2px", flex: 1 }}>
            {row.map((num) => (
              <Button
                key={num}
                variant="outlined"
                onClick={() => handleNumberClick(num)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: "clamp(1.5rem, 10vw, 7vh)",
                  fontWeight: 700,
                  p: 0,
                  lineHeight: 1,
                  minHeight: 0,
                }}
              >
                {formatButtonLabel(num, modifier)}
              </Button>
            ))}
          </Box>
        ))}

        {/* Bottom row: 25/Bull and Miss */}
        <Box sx={{ display: "flex", gap: "2px", flex: 1 }}>
          <Button
            variant="outlined"
            onClick={handleBull}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "clamp(1.5rem, 10vw, 7vh)",
              fontWeight: 700,
              p: 0,
              lineHeight: 1,
              minHeight: 0,
              bgcolor: modifier >= 2 ? "rgba(0,188,212,0.2)" : undefined,
            }}
          >
            {getBullButtonText(modifier)}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleMiss}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "clamp(1.5rem, 10vw, 7vh)",
              fontWeight: 700,
              p: 0,
              lineHeight: 1,
              minHeight: 0,
            }}
          >
            M
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
