/**
 * ManagePlayersDialog - dialog to view, edit, and delete remembered players
 */

import { useState, type JSX } from "react";
import { observer } from "mobx-react-lite";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useStores } from "../../hooks/useStores";

interface ManagePlayersDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ManagePlayersDialog = observer(function ManagePlayersDialog({
  open,
  onClose,
}: ManagePlayersDialogProps): JSX.Element {
  const { presetStore } = useStores();
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (name: string): void => {
    setEditingName(name);
    setEditValue(name);
  };

  const handleCancelEdit = (): void => {
    setEditingName(null);
    setEditValue("");
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (editingName && editValue.trim()) {
      await presetStore.updateRememberedPlayer(editingName, editValue.trim());
    }
    setEditingName(null);
    setEditValue("");
  };

  const handleDelete = async (name: string): Promise<void> => {
    await presetStore.forgetPlayer(name);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Remembered Players</DialogTitle>
      <DialogContent>
        {presetStore.rememberedPlayers.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No remembered players yet. Players will be saved automatically when you add them.
          </Typography>
        ) : (
          <List dense>
            {presetStore.rememberedPlayers.map((name) => (
              <ListItem
                key={name}
                secondaryAction={
                  editingName === name ? (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton edge="end" size="small" onClick={handleSaveEdit} color="primary">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" size="small" onClick={handleCancelEdit}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton edge="end" size="small" onClick={() => handleStartEdit(name)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDelete(name)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )
                }
              >
                {editingName === name ? (
                  <TextField
                    size="small"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    autoFocus
                    fullWidth
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <ListItemText primary={name} />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});
