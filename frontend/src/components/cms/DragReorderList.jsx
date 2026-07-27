import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

function SortableRow({ id, disabled, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} className="flex items-start gap-2">
      <IconButton
        size="small"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label="Drag to reorder"
        sx={{ cursor: disabled ? "not-allowed" : "grab", mt: 1, touchAction: "none", flexShrink: 0 }}
      >
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <Box className="flex-1 min-w-0">{children}</Box>
    </Box>
  );
}

/**
 * Reusable drag-and-drop reorder list, built on @dnd-kit (pointer AND
 * keyboard sensors, so reordering is fully accessible — not
 * mouse-only). Fully controlled: it never owns the list itself, it
 * only reports the reordered array via `onReorder` and renders each
 * item through the caller's `renderItem`. Used for both flat lists
 * (Footer columns) and per-parent nested lists (Navigation dropdown
 * children, Footer column links) by mounting one instance per level.
 */
export default function DragReorderList({
  items,
  getId = (item) => item._tempId ?? item._id,
  renderItem,
  onReorder,
  disabled = false,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => getId(item) === active.id);
      const newIndex = items.findIndex((item) => getId(item) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(arrayMove(items, oldIndex, newIndex));
    },
    [items, getId, onReorder],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <Box className="flex flex-col gap-2">
          {items.map((item, index) => (
            <SortableRow key={getId(item)} id={getId(item)} disabled={disabled}>
              {renderItem({ item, index })}
            </SortableRow>
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
