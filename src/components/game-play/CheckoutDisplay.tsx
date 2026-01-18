/**
 * CheckoutDisplay - shows checkout suggestion when in range
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { CheckoutSuggestion } from "../../types";

interface CheckoutDisplayProps {
  suggestion: CheckoutSuggestion | null;
}

export const CheckoutDisplay = observer(function CheckoutDisplay({
  suggestion,
}: CheckoutDisplayProps): JSX.Element | null {
  if (!suggestion) return null;

  return (
    <Box
      sx={{
        py: 1,
        px: 2,
        bgcolor: "success.dark",
        borderRadius: 1,
        mx: 2,
        mb: 1,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
        Checkout
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        {suggestion.description}
      </Typography>
    </Box>
  );
});
