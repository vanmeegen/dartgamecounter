/**
 * CurrentVisitDisplay - shows the 3 darts in current visit
 * Shared across all dart games that use visit-based scoring.
 *
 * After a visit completes (3 darts / bust / checkout), the display
 * freezes for 1 second so the player can read the result before it
 * clears for the next turn.
 */

import { useState, useEffect, useRef, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { Visit } from "../../types";
import { formatDart, getDartValue } from "../../types/dart.types";

interface CurrentVisitDisplayProps {
  visit: Visit;
  lastCompletedVisit?: Visit | null;
}

export const CurrentVisitDisplay = observer(function CurrentVisitDisplay({
  visit,
  lastCompletedVisit,
}: CurrentVisitDisplayProps): JSX.Element {
  const [frozenVisit, setFrozenVisit] = useState<Visit | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (lastCompletedVisit && lastCompletedVisit.darts.length > 0) {
      // Visit just completed - freeze the display for 1s
      setFrozenVisit(lastCompletedVisit);
      timerRef.current = setTimeout(() => setFrozenVisit(null), 1000);
      return (): void => clearTimeout(timerRef.current);
    }
    // lastCompletedVisit cleared (new dart thrown or undo) - unfreeze immediately
    setFrozenVisit(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [lastCompletedVisit]);

  // Show frozen visit when current visit is empty, otherwise show live visit
  const displayVisit = visit.darts.length > 0 ? visit : (frozenVisit ?? visit);

  const slots = [0, 1, 2].map((index) => {
    const dart = displayVisit.darts[index];
    return dart ? { display: formatDart(dart), value: getDartValue(dart) } : null;
  });

  const isBusted = displayVisit.busted;
  const displayTotal = displayVisit.total;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        bgcolor: "secondary.dark",
        borderRadius: 1,
        px: 1,
        py: 0.5,
      }}
    >
      {slots.map((slot, index) => (
        <Paper
          key={index}
          elevation={slot ? 2 : 0}
          sx={{
            width: { xs: 64, sm: 72 },
            height: { xs: 48, sm: 54 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: slot ? "background.paper" : "action.disabledBackground",
            border: isBusted && slot ? "2px solid" : "none",
            borderColor: "error.main",
          }}
        >
          {slot ? (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.4rem", sm: "1.6rem" },
                lineHeight: 1,
                color: isBusted ? "error.main" : "text.primary",
              }}
            >
              {slot.display}
            </Typography>
          ) : (
            <Typography color="text.disabled" sx={{ fontSize: "1.2rem" }}>
              —
            </Typography>
          )}
        </Paper>
      ))}

      {/* Total or bust indicator */}
      {isBusted ? (
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 700, ml: 0.5 }}>
          BUST
        </Typography>
      ) : displayTotal > 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          ={displayTotal}
        </Typography>
      ) : null}
    </Box>
  );
});
