/**
 * GameConfigView - game selection + game-specific configuration
 *
 * The game selector is shown at the top. Below it, the registry-provided
 * ConfigComponent for the selected game is rendered dynamically.
 */

import { useState, useEffect, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { useStores } from "../../hooks/useStores";
import { SavePresetDialog } from "../presets/SavePresetDialog";
import { gameRegistry } from "../../games/registry";

export const GameConfigView = observer(function GameConfigView(): JSX.Element {
  const { playerSetupStore, gameStore, uiStore } = useStores();
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const availableGames = gameRegistry.getAll();

  // Auto-select first game if none selected
  useEffect(() => {
    if (!gameStore.selectedGameId && availableGames.length > 0) {
      gameStore.selectGame(availableGames[0].id);
    }
  }, [gameStore, availableGames]);

  const selectedDefinition = gameStore.currentGameDefinition;

  const handleBack = (): void => {
    uiStore.goToPlayerSetup();
  };

  const handleGameTypeChange = (_: React.MouseEvent<HTMLElement>, value: string | null): void => {
    if (value !== null) {
      gameStore.selectGame(value);
    }
  };

  const handleStartGame = (): void => {
    gameStore.startGame(playerSetupStore.players);
    uiStore.goToGamePlay();
  };

  const handleConfigChange = (config: unknown): void => {
    gameStore.updateConfig(config);
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

      {/* Game type selector */}
      {availableGames.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Game Type
          </Typography>
          <ToggleButtonGroup
            value={gameStore.selectedGameId}
            exclusive
            onChange={handleGameTypeChange}
            fullWidth
          >
            {availableGames.map((game) => (
              <ToggleButton key={game.id} value={game.id}>
                {game.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {selectedDefinition && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {selectedDefinition.description}
            </Typography>
          )}
        </Box>
      )}

      {/* Game-specific configuration (dynamically rendered) */}
      {selectedDefinition && gameStore.gameConfig && (
        <selectedDefinition.ConfigComponent
          config={gameStore.gameConfig}
          onConfigChange={handleConfigChange}
        />
      )}

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
          disabled={playerSetupStore.players.length === 0 || !gameStore.selectedGameId}
        >
          Start Game
        </Button>
      </Box>

      <SavePresetDialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} />
    </Container>
  );
});
