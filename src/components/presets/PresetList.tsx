/**
 * PresetList - displays saved presets for quick game start
 */

import { type JSX } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PeopleIcon from "@mui/icons-material/People";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import { useStores } from "../../hooks/useStores";
import { isGamePreset, type Preset } from "../../types";

export const PresetList = observer(function PresetList(): JSX.Element {
  const rootStore = useStores();
  const { presetStore } = rootStore;

  if (presetStore.isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading presets...
        </Typography>
      </Box>
    );
  }

  if (presetStore.presets.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No saved presets yet. Add players and save a preset to start games quickly.
        </Typography>
      </Box>
    );
  }

  const handleLoadPreset = (preset: Preset): void => {
    rootStore.loadPreset(preset);
  };

  const handleDeletePreset = async (preset: Preset): Promise<void> => {
    await presetStore.deletePreset(preset.id);
  };

  const getPresetDescription = (preset: Preset): string => {
    const playerCount = preset.playerNames.length;
    const playerText = `${playerCount} player${playerCount !== 1 ? "s" : ""}`;

    if (isGamePreset(preset)) {
      const config = preset.gameConfig;
      const gameName = preset.gameType?.toUpperCase() ?? "Game";
      const details = config.variant ? `${config.variant} ${config.outRule ?? ""} out` : gameName;
      return `${playerText} - ${details}`;
    }
    return playerText;
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Quick Start
      </Typography>
      <List dense disablePadding>
        {presetStore.sortedPresets.map((preset) => (
          <ListItem
            key={preset.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleDeletePreset(preset)}
                aria-label="delete preset"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => handleLoadPreset(preset)}>
              {isGamePreset(preset) ? (
                <SportsEsportsIcon sx={{ mr: 1, color: "primary.main" }} />
              ) : (
                <PeopleIcon sx={{ mr: 1, color: "secondary.main" }} />
              )}
              <ListItemText primary={preset.name} secondary={getPresetDescription(preset)} />
              <PlayArrowIcon sx={{ ml: 1, color: "success.main" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
});
