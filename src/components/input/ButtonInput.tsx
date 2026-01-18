/**
 * ButtonInput - number grid (1-20, 25, Bull) with modifiers (S, D, T, M)
 */

import { useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import type { Multiplier } from "../../types";

interface ButtonInputProps {
  onThrow: (segment: number, multiplier: Multiplier) => void;
  onUndo: () => void;
}

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
    // Bull (50) is always double, 25 is single bull
    if (modifier === 1) {
      onThrow(25, 1); // Single bull
    } else {
      onThrow(50, 1); // Double bull (Bull)
    }
    setModifier(1);
  };

  const numbers = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
  ];

  const getModifierColor = (mod: Multiplier): "primary" | "secondary" | "inherit" => {
    if (modifier === mod) return "primary";
    return "inherit";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", height: "100%" }}>
      {/* Modifier buttons */}
      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
        <Button
          variant={modifier === 1 ? "contained" : "outlined"}
          color={getModifierColor(1)}
          onClick={() => setModifier(1)}
          size="small"
          sx={{ minWidth: 50, py: 0.5 }}
        >
          S
        </Button>
        <Button
          variant={modifier === 2 ? "contained" : "outlined"}
          color={getModifierColor(2)}
          onClick={() => setModifier(2)}
          size="small"
          sx={{ minWidth: 50, py: 0.5 }}
        >
          D
        </Button>
        <Button
          variant={modifier === 3 ? "contained" : "outlined"}
          color={getModifierColor(3)}
          onClick={() => setModifier(3)}
          size="small"
          sx={{ minWidth: 50, py: 0.5 }}
        >
          T
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleMiss}
          size="small"
          sx={{ minWidth: 50, py: 0.5 }}
        >
          M
        </Button>
        <IconButton onClick={onUndo} size="small">
          <UndoIcon fontSize="small" />
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
                  fontSize: "min(8vw, 8vh)",
                  fontWeight: 700,
                  p: 0,
                  lineHeight: 1,
                }}
              >
                {modifier === 1 ? num : modifier === 2 ? `D${num}` : `T${num}`}
              </Button>
            ))}
          </Box>
        ))}

        {/* Bottom row: 25 and Bull */}
        <Box sx={{ display: "flex", gap: "2px", flex: 1 }}>
          <Button
            variant="outlined"
            onClick={handleBull}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: "min(8vw, 8vh)",
              fontWeight: 700,
              p: 0,
              lineHeight: 1,
              bgcolor: modifier >= 2 ? "secondary.dark" : undefined,
            }}
          >
            {modifier >= 2 ? "Bull" : "25"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
