/**
 * GameConfigView - main view for game configuration (E2)
 * Basic implementation for E1 completion - full implementation in E2
 */

import type { JSX } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useUIStore, usePlayerSetupStore } from "../../hooks/useStores";

export function GameConfigView(): JSX.Element {
  const uiStore = useUIStore();
  const playerSetupStore = usePlayerSetupStore();

  const handleBack = (): void => {
    uiStore.goToPlayerSetup();
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Back to Players
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Game Setup
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Players: {playerSetupStore.players.map((p) => p.name).join(", ")}
      </Typography>

      <Box
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary">Game configuration coming in E2...</Typography>
      </Box>
    </Container>
  );
}
