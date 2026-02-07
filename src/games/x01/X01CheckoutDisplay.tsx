/**
 * X01CheckoutDisplay - shows checkout suggestion when in range
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { CheckoutSuggestion } from "./types";

interface X01CheckoutDisplayProps {
  suggestion: CheckoutSuggestion | null;
}

export const X01CheckoutDisplay = observer(function X01CheckoutDisplay({
  suggestion,
}: X01CheckoutDisplayProps): JSX.Element | null {
  if (!suggestion) return null;

  return (
    <Box
      sx={{
        py: 0.5,
        px: 1.5,
        bgcolor: "success.dark",
        borderRadius: 1,
        ml: "auto",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.8 }}>
        OUT:
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
        {suggestion.description}
      </Typography>
    </Box>
  );
});
