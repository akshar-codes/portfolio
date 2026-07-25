import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import EmptyState from "../../common/EmptyState";
import DataTablePagination from "./DataTablePagination";

/**
 * Generic, presentation-only data table. It owns no fetching, filtering,
 * or CRUD logic — pages compose it with `Toolbar`/`FilterBar` (passed
 * via the `toolbar` slot) plus their own React Query hooks. Sorting and
 * selection are fully controlled: DataTable reports intent through
 * `onSortChange`/`onSelectionChange` and renders back whatever state
 * it's given.
 *
 * columns: [{ field, headerName, align, width, hideOnMobile, sortable, render(row) }]
 */
export default function DataTable({
  columns,
  rows,
  getRowId = (row) => row._id ?? row.id,
  isRowSelectable = () => true,
  loading = false,
  fetching = false,
  error = null,
  onRetry,
  emptyIcon = <InboxOutlinedIcon fontSize="large" />,
  emptyTitle = "Nothing here yet",
  emptyDescription = "",
  rowActions,
  actionsHeader = "Actions",
  sortModel,
  onSortChange,
  selectable = false,
  selectedIds,
  onSelectionChange,
  toolbar,
  pagination,
  dense = false,
  ariaLabel = "Data table",
}) {
  const showSkeleton = loading && rows.length === 0;
  const showEmpty = !loading && !error && rows.length === 0;

  const selectableIds = selectable ? rows.filter(isRowSelectable).map(getRowId) : [];
  const allSelected = selectable && selectableIds.length > 0 && selectableIds.every((id) => selectedIds?.has(id));
  const someSelected = selectable && selectableIds.some((id) => selectedIds?.has(id));

  const toggleAll = (checked) => {
    const next = new Set(selectedIds);
    if (checked) selectableIds.forEach((id) => next.add(id));
    else selectableIds.forEach((id) => next.delete(id));
    onSelectionChange(next);
  };

  const toggleRow = (id, checked) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectionChange(next);
  };

  const colSpan = columns.length + (rowActions ? 1 : 0) + (selectable ? 1 : 0);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {toolbar && <Box className="px-4 pt-3">{toolbar}</Box>}

      {fetching && !showSkeleton && <LinearProgress sx={{ height: 2 }} />}

      {error ? (
        <Box className="p-8 flex flex-col items-center text-center gap-3">
          <Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
            {error}
          </Alert>
          {onRetry && (
            <Button variant="outlined" size="small" onClick={onRetry}>
              Try again
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size={dense ? "small" : "medium"} aria-label={ariaLabel}>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                      disabled={selectableIds.length === 0}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.field}
                    align={col.align ?? "left"}
                    sx={{
                      width: col.width,
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "text.secondary",
                      display: col.hideOnMobile ? { xs: "none", md: "table-cell" } : undefined,
                    }}
                  >
                    {col.sortable && onSortChange ? (
                      <TableSortLabel
                        active={sortModel?.field === col.field}
                        direction={sortModel?.field === col.field ? sortModel.direction : "asc"}
                        onClick={() => onSortChange(col.field)}
                      >
                        {col.headerName}
                      </TableSortLabel>
                    ) : (
                      col.headerName
                    )}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}
                  >
                    {actionsHeader}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {showSkeleton &&
                Array.from({ length: 5 }).map((_, rowIdx) => (
                  <TableRow key={`skeleton-${rowIdx}`}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Skeleton variant="rounded" width={20} height={20} />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.field}>
                        <Skeleton variant="text" height={22} />
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell>
                        <Skeleton variant="text" height={22} />
                      </TableCell>
                    )}
                  </TableRow>
                ))}

              {showEmpty && (
                <TableRow>
                  <TableCell colSpan={colSpan} sx={{ border: 0 }}>
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              )}

              {!showSkeleton &&
                rows.map((row) => {
                  const id = getRowId(row);
                  const rowSelectable = isRowSelectable(row);
                  return (
                    <TableRow key={id} hover selected={selectable && !!selectedIds?.has(id)}>
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={!!selectedIds?.has(id)}
                            disabled={!rowSelectable}
                            onChange={(e) => toggleRow(id, e.target.checked)}
                          />
                        </TableCell>
                      )}
                      {columns.map((col) => (
                        <TableCell
                          key={col.field}
                          align={col.align ?? "left"}
                          sx={{ display: col.hideOnMobile ? { xs: "none", md: "table-cell" } : undefined }}
                        >
                          {col.render ? col.render(row) : row[col.field]}
                        </TableCell>
                      ))}
                      {rowActions && (
                        <TableCell align="right">
                          <Box className="flex items-center justify-end gap-1">{rowActions(row)}</Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pagination && !error && <DataTablePagination {...pagination} />}
    </Paper>
  );
}
