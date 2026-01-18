/**
 * PlayerList - displays list of players with drag & drop reordering
 */

import type { JSX } from "react";
import { observer } from "mobx-react-lite";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Player } from "../../types";
import { SortablePlayerItem } from "./SortablePlayerItem";

interface PlayerListProps {
  players: Player[];
  editingPlayerId: string | null;
  onEdit: (playerId: string | null) => void;
  onUpdate: (playerId: string, newName: string) => void;
  onRemove: (playerId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export const PlayerList = observer(function PlayerList({
  players,
  editingPlayerId,
  onEdit,
  onUpdate,
  onRemove,
  onReorder,
}: PlayerListProps): JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = players.findIndex((p) => p.id === active.id);
      const newIndex = players.findIndex((p) => p.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (players.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
        No players added yet. Add a player to get started.
      </Typography>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <List disablePadding>
          {players.map((player) => (
            <SortablePlayerItem
              key={player.id}
              player={player}
              isEditing={editingPlayerId === player.id}
              onEdit={() => onEdit(player.id)}
              onCancelEdit={() => onEdit(null)}
              onUpdate={(newName) => onUpdate(player.id, newName)}
              onRemove={() => onRemove(player.id)}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  );
});
