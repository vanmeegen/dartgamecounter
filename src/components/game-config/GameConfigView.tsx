/**
 * GameConfigView - main view for game configuration (E2)
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { useStores } from "../../hooks/useStores";
import { SavePresetDialog } from "../presets/SavePresetDialog";
import type { X01Variant, OutRule } from "../../types";

export const GameConfigView = observer(function GameConfigView(): JSX.Element {
  const { playerSetupStore, gameStore, uiStore } = useStores();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleBack = (): void => {
    uiStore.goToPlayerSetup();
  };

  const handleVariantChange = (
    _: React.MouseEvent<HTMLElement>,
    value: X01Variant | null
  ): void => {
    if (value !== null) {
      gameStore.setVariant(value);
    }
  };

  const handleOutRuleChange = (_: React.MouseEvent<HTMLElement>, value: OutRule | null): void => {
    if (value !== null) {
      gameStore.setOutRule(value);
    }
  };

  const handleStartGame = (): void => {
    gameStore.startGame(playerSetupStore.players);
    uiStore.goToGamePlay();
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Game Variant
        </Typography>
        <ToggleButtonGroup
          value={gameStore.variant}
          exclusive
          onChange={handleVariantChange}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value={301}>301</ToggleButton>
          <ToggleButton value={501}>501</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="h6" gutterBottom>
          Out Rule
        </Typography>
        <ToggleButtonGroup
          value={gameStore.outRule}
          exclusive
          onChange={handleOutRuleChange}
          fullWidth
        >
          <ToggleButton value="single">Single Out</ToggleButton>
          <ToggleButton value="double">Double Out</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SaveIcon />}
          onClick={() => setShowSaveDialog(true)}
          disabled={playerSetupStore.players.length === 0}
        >
          Save Preset
        </Button>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          onClick={handleStartGame}
          disabled={playerSetupStore.players.length === 0}
        >
          Start Game
        </Button>
      </Box>

      <SavePresetDialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} />
    </Container>
  );
});
