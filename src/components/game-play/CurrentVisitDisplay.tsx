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
    <Box sx={{ px: 2, pb: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {slots.map((slot, index) => (
          <Paper
            key={index}
            sx={{
              width: 70,
              height: 70,
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
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: visit.busted ? "error.main" : "text.primary",
                  }}
                >
                  {slot.display}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {slot.value}
                </Typography>
              </>
            ) : (
              <Typography color="text.disabled">—</Typography>
            )}
          </Paper>
        ))}
      </Box>

      {/* Total and bust indicator */}
      <Box sx={{ textAlign: "center", mt: 1 }}>
        {visit.busted ? (
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
            BUST!
          </Typography>
        ) : visit.total > 0 ? (
          <Typography variant="body2" color="text.secondary">
            Total: {visit.total}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
});
