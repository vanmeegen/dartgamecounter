/**
 * PlayerSetupView - main view for player setup (E1)
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { usePlayerSetupStore, useUIStore } from "../../hooks/useStores";
import { AddPlayerForm } from "./AddPlayerForm";
import { PlayerList } from "./PlayerList";
import { NextButton } from "./NextButton";

export const PlayerSetupView = observer(function PlayerSetupView(): JSX.Element {
  const playerSetupStore = usePlayerSetupStore();
  const uiStore = useUIStore();
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const handleAddPlayer = (name: string): void => {
    playerSetupStore.addPlayer(name);
  };

  const handleRemovePlayer = (playerId: string): void => {
    playerSetupStore.removePlayer(playerId);
    if (editingPlayerId === playerId) {
      setEditingPlayerId(null);
    }
  };

  const handleUpdatePlayer = (playerId: string, newName: string): void => {
    playerSetupStore.updatePlayerName(playerId, newName);
    setEditingPlayerId(null);
  };

  const handleReorderPlayers = (fromIndex: number, toIndex: number): void => {
    playerSetupStore.reorderPlayers(fromIndex, toIndex);
  };

  const handleNext = (): void => {
    if (playerSetupStore.canProceed) {
      uiStore.goToGameConfig();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Players
      </Typography>

      <AddPlayerForm onAdd={handleAddPlayer} />

      <Box sx={{ my: 3 }}>
        <PlayerList
          players={playerSetupStore.players}
          editingPlayerId={editingPlayerId}
          onEdit={setEditingPlayerId}
          onUpdate={handleUpdatePlayer}
          onRemove={handleRemovePlayer}
          onReorder={handleReorderPlayers}
        />
      </Box>

      <NextButton disabled={!playerSetupStore.canProceed} onClick={handleNext} />
    </Container>
  );
});
