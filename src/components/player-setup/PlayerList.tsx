/**
 * PlayerList - displays list of players with edit/remove functionality
 */

import type { JSX } from "react";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import type { Player } from "../../types";
import { PlayerListItem } from "./PlayerListItem";

interface PlayerListProps {
  players: Player[];
  editingPlayerId: string | null;
  onEdit: (playerId: string | null) => void;
  onUpdate: (playerId: string, newName: string) => void;
  onRemove: (playerId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function PlayerList({
  players,
  editingPlayerId,
  onEdit,
  onUpdate,
  onRemove,
}: PlayerListProps): JSX.Element {
  if (players.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
        No players added yet. Add a player to get started.
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {players.map((player, index) => (
        <PlayerListItem
          key={player.id}
          player={player}
          index={index}
          isEditing={editingPlayerId === player.id}
          onEdit={() => onEdit(player.id)}
          onCancelEdit={() => onEdit(null)}
          onUpdate={(newName) => onUpdate(player.id, newName)}
          onRemove={() => onRemove(player.id)}
        />
      ))}
    </List>
  );
}
