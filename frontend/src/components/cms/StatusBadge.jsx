import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { CONTENT_STATUS_META, CONTENT_STATUS_SCHEDULED } from "../../constants/contentStatus";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Renders the current publish status as a colored chip. When
 * `status === "scheduled"`, hovering shows the exact publishAt time.
 *
 * @param {{ status: string, publishAt?: string, size?: 'small'|'medium' }} props
 */
export default function StatusBadge({ status, publishAt, size = "small" }) {
  const meta = CONTENT_STATUS_META[status] ?? {
    label: status ?? "Unknown",
    color: "default",
    variant: "outlined",
  };

  const chip = (
    <Chip size={size} color={meta.color} variant={meta.variant} label={meta.label} />
  );

  if (status === CONTENT_STATUS_SCHEDULED && publishAt) {
    return <Tooltip title={`Publishes ${formatDateTime(publishAt)}`}>{chip}</Tooltip>;
  }

  return chip;
}
