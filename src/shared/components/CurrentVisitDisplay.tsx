/**
 * CurrentVisitDisplay - shows the 3 darts in current visit
 * Shared across all dart games that use visit-based scoring.
 *
 * After a visit completes (3 darts / bust / checkout), the display
 * freezes for 3 seconds so the player can read the result before it
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
      // Visit just completed - freeze the display for 3s
      setFrozenVisit(lastCompletedVisit);
      timerRef.current = setTimeout(() => setFrozenVisit(null), 3000);
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
        gap: 0.75,
        flex: 1,
        background: "linear-gradient(135deg, rgba(0,188,212,0.15) 0%, rgba(0,230,118,0.10) 100%)",
        border: "1px solid",
        borderColor: "rgba(0,188,212,0.25)",
        borderRadius: 1.5,
        px: 1,
        py: 0.5,
      }}
    >
      {slots.map((slot, index) => (
        <Paper
          key={index}
          elevation={slot ? 3 : 0}
          sx={{
            width: { xs: 64, sm: 72 },
            height: { xs: 48, sm: 54 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: slot ? "background.paper" : "rgba(255,255,255,0.04)",
            border: isBusted && slot ? "2px solid" : "1px solid",
            borderColor: isBusted && slot
              ? "error.main"
              : slot
                ? "rgba(0,188,212,0.3)"
                : "rgba(255,255,255,0.06)",
            borderRadius: 1,
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
            <Typography sx={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.15)" }}>
              —
            </Typography>
          )}
        </Paper>
      ))}

      {/* Total or bust indicator - large, filling right space */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 48,
        }}
      >
        {isBusted ? (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
              color: "error.main",
              letterSpacing: 1,
            }}
          >
            BUST
          </Typography>
        ) : displayTotal > 0 ? (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.6rem", sm: "2rem" },
              color: "primary.main",
              lineHeight: 1,
            }}
          >
            = {displayTotal}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
});
