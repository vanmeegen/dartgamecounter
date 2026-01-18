/**
 * PlayerListItem - individual player item with edit/remove functionality
 */

import { useState, type JSX, type FormEvent } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { Player } from "../../types";

interface PlayerListItemProps {
  player: Player;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (newName: string) => void;
  onRemove: () => void;
}

export function PlayerListItem({
  player,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onRemove,
}: PlayerListItemProps): JSX.Element {
  const [editName, setEditName] = useState(player.name);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (trimmedName) {
      onUpdate(trimmedName);
    }
  };

  const handleStartEdit = (): void => {
    setEditName(player.name);
    onEdit();
  };

  const handleCancel = (): void => {
    setEditName(player.name);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <ListItem
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1,
          mb: 1,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            width: "100%",
            gap: 1,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <IconButton type="submit" color="primary" size="small" disabled={!editName.trim()}>
            <CheckIcon />
          </IconButton>
          <IconButton size="small" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem
      sx={{
        bgcolor: "background.paper",
        borderRadius: 1,
        mb: 1,
      }}
      secondaryAction={
        <Box>
          <IconButton size="small" onClick={handleStartEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <DragIndicatorIcon sx={{ color: "text.disabled", cursor: "grab" }} />
      </ListItemIcon>
      <ListItemText primary={player.name} />
    </ListItem>
  );
}
