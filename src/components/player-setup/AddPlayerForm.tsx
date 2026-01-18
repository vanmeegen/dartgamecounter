/**
 * AddPlayerForm - form to add a new player
 */

import { useState, type JSX, type FormEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

interface AddPlayerFormProps {
  onAdd: (name: string) => void;
}

export function AddPlayerForm({ onAdd }: AddPlayerFormProps): JSX.Element {
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onAdd(trimmedName);
      setName("");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Enter player name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
        autoFocus
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!name.trim()}
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "&:hover": {
            bgcolor: "primary.dark",
          },
          "&:disabled": {
            bgcolor: "action.disabledBackground",
          },
        }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
}
