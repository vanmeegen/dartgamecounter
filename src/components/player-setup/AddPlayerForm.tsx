/**
 * AddPlayerForm - form to add a new player with autocomplete from remembered names
 */

import { useState, useRef, type JSX, type FormEvent } from "react";
import { observer } from "mobx-react-lite";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import { useStores } from "../../hooks/useStores";

interface AddPlayerFormProps {
  onAdd: (name: string) => void;
}

export const AddPlayerForm = observer(function AddPlayerForm({
  onAdd,
}: AddPlayerFormProps): JSX.Element {
  const { presetStore } = useStores();
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  // Track if player was just added via autocomplete to prevent double-add
  const justAddedRef = useRef(false);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    // Skip if player was just added via autocomplete selection
    if (justAddedRef.current) {
      justAddedRef.current = false;
      return;
    }
    const trimmedName = inputValue.trim();
    if (trimmedName) {
      onAdd(trimmedName);
      presetStore.rememberPlayer(trimmedName);
      setInputValue("");
      setSelectedValue(null);
    }
  };

  const handleAutocompleteChange = (_event: React.SyntheticEvent, value: string | null): void => {
    if (value) {
      onAdd(value);
      presetStore.rememberPlayer(value);
      justAddedRef.current = true;
      setInputValue("");
      setSelectedValue(null);
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
      <Autocomplete
        freeSolo
        fullWidth
        options={presetStore.rememberedPlayers}
        value={selectedValue}
        inputValue={inputValue}
        onInputChange={(_e, value) => setInputValue(value)}
        onChange={handleAutocompleteChange}
        clearOnBlur={false}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder="Enter player name" autoFocus />
        )}
        filterOptions={(options, { inputValue: input }) => {
          const filtered = options.filter((option) =>
            option.toLowerCase().includes(input.toLowerCase())
          );
          return filtered;
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!inputValue.trim()}
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
});
