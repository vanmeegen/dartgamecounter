/**
 * SortablePlayerItem - wrapper for PlayerListItem with drag & drop
 */

import type { JSX } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Box from "@mui/material/Box";
import type { Player } from "../../types";
import { PlayerListItem } from "./PlayerListItem";

interface SortablePlayerItemProps {
  player: Player;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (newName: string) => void;
  onRemove: () => void;
}

export function SortablePlayerItem({
  player,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onRemove,
}: SortablePlayerItemProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <PlayerListItem
        player={player}
        isEditing={isEditing}
        onEdit={onEdit}
        onCancelEdit={onCancelEdit}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </Box>
  );
}
