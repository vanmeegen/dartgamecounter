/**
 * PlayerSetupView - main view for player setup (E1)
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import PeopleIcon from "@mui/icons-material/People";
import { usePlayerSetupStore, useUIStore } from "../../hooks/useStores";
import { AddPlayerForm } from "./AddPlayerForm";
import { PlayerList } from "./PlayerList";
import { NextButton } from "./NextButton";
import { PresetList } from "../presets/PresetList";
import { ManagePlayersDialog } from "../dialogs/ManagePlayersDialog";

export const PlayerSetupView = observer(function PlayerSetupView(): JSX.Element {
  const playerSetupStore = usePlayerSetupStore();
  const uiStore = useUIStore();
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [showManagePlayers, setShowManagePlayers] = useState(false);

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
      {/* PWA Install Banner */}
      {uiStore.canInstall && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<InstallMobileIcon />}
              onClick={() => uiStore.promptInstall()}
            >
              Install
            </Button>
          }
        >
          Install this app for offline use
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" component="h1">
          Players
        </Typography>
        <IconButton
          onClick={() => setShowManagePlayers(true)}
          title="Manage remembered players"
          size="small"
        >
          <PeopleIcon />
        </IconButton>
      </Box>

      {/* Presets section */}
      <PresetList />

      <Divider sx={{ my: 2 }} />

      {/* Manual player setup */}
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

      {/* Manage remembered players dialog */}
      <ManagePlayersDialog open={showManagePlayers} onClose={() => setShowManagePlayers(false)} />
    </Container>
  );
});
