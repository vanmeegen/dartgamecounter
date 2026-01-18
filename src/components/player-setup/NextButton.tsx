/**
 * NextButton - button to proceed to game config
 */

import type { JSX } from "react";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface NextButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function NextButton({ disabled, onClick }: NextButtonProps): JSX.Element {
  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      endIcon={<ArrowForwardIcon />}
      disabled={disabled}
      onClick={onClick}
    >
      Next: Game Setup
    </Button>
  );
}
