/**
 * SavePresetDialog - dialog for saving current setup as a preset
 */

import { useState, type JSX } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useStores } from "../../hooks/useStores";

interface SavePresetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SavePresetDialog({ open, onClose }: SavePresetDialogProps): JSX.Element {
  const rootStore = useStores();
  const [presetName, setPresetName] = useState("");
  const [includeGameConfig, setIncludeGameConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    if (!presetName.trim()) return;

    setIsSaving(true);
    try {
      if (includeGameConfig) {
        await rootStore.saveCurrentAsGamePreset(presetName.trim());
      } else {
        await rootStore.saveCurrentAsPlayerPreset(presetName.trim());
      }
      setPresetName("");
      setIncludeGameConfig(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (): void => {
    setPresetName("");
    setIncludeGameConfig(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (presetName.trim() && !isSaving) {
            handleSave();
          }
        }}
      >
        <DialogTitle>Save Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            variant="outlined"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            disabled={isSaving}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeGameConfig}
                onChange={(e) => setIncludeGameConfig(e.target.checked)}
                disabled={isSaving}
              />
            }
            label="Include game settings (variant, out rule)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!presetName.trim() || isSaving}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
