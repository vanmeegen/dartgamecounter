/**
 * CurrentVisitDisplay - shows the 3 darts in current visit
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { Visit } from "../../types";
import { formatDart, getDartValue } from "../../types/dart.types";

interface CurrentVisitDisplayProps {
  visit: Visit;
}

export const CurrentVisitDisplay = observer(function CurrentVisitDisplay({
  visit,
}: CurrentVisitDisplayProps): JSX.Element {
  // Create array of 3 slots
  const slots = [0, 1, 2].map((index) => {
    const dart = visit.darts[index];
    return dart ? { display: formatDart(dart), value: getDartValue(dart) } : null;
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {slots.map((slot, index) => (
        <Paper
          key={index}
          sx={{
            width: { xs: 52, sm: 60 },
            height: { xs: 44, sm: 50 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: slot ? "background.paper" : "action.disabledBackground",
            border: visit.busted && slot ? "2px solid" : "none",
            borderColor: "error.main",
          }}
        >
          {slot ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  lineHeight: 1.2,
                  color: visit.busted ? "error.main" : "text.primary",
                }}
              >
                {slot.display}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem", lineHeight: 1 }}
              >
                {slot.value}
              </Typography>
            </>
          ) : (
            <Typography color="text.disabled">—</Typography>
          )}
        </Paper>
      ))}

      {/* Total or bust indicator */}
      {visit.busted ? (
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 700, ml: 0.5 }}>
          BUST
        </Typography>
      ) : visit.total > 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          ={visit.total}
        </Typography>
      ) : null}
    </Box>
  );
});
