import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import PageHeader from "../../components/common/PageHeader";

const ACTIONS = ["create", "update", "delete", "publish", "unpublish", "login", "logout", "media_upload"];
const ACTION_LABELS = { media_upload: "Media upload" };

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Activity() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const params = useMemo(() => ({ search: search || undefined, action: action || undefined, resource: resource || undefined, from: from || undefined, to: to ? `${to}T23:59:59.999` : undefined, page, limit: 30 }), [search, action, resource, from, to, page]);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "activity", params],
    queryFn: () => api.get(API_ENDPOINTS.adminActivity, { params }).then((res) => res.data),
    placeholderData: (previous) => previous,
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data: blob } = await api.get(API_ENDPOINTS.adminActivityExport, { params: { ...params, page: undefined, limit: undefined }, responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "activity-log.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "Could not export activity log.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader title="Activity Log" subtitle="Append-only record of administrator actions." actions={<Button variant="outlined" startIcon={exporting ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />} onClick={exportCsv} disabled={exporting}>Export CSV</Button>} />
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField size="small" label="Search activity, user, or IP" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> } }} sx={{ flex: 2 }} />
          <TextField size="small" select label="Action" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} sx={{ minWidth: 150 }}><MenuItem value="">All actions</MenuItem>{ACTIONS.map((value) => <MenuItem key={value} value={value}>{ACTION_LABELS[value] || value[0].toUpperCase() + value.slice(1)}</MenuItem>)}</TextField>
          <TextField size="small" select label="Module" value={resource} onChange={(event) => { setResource(event.target.value); setPage(1); }} sx={{ minWidth: 165 }}><MenuItem value="">All modules</MenuItem>{["project", "category", "about", "profile", "resume", "navigation", "footer", "SEO", "site settings", "media", "media folder", "admin"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
          <TextField size="small" type="date" label="From" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="date" label="To" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
        </Stack>
      </Paper>

      {isLoading ? <Box className="flex justify-center py-16"><CircularProgress /></Box> : isError ? <Paper variant="outlined" sx={{ p: 3 }}><Typography color="error" sx={{ mb: 2 }}>{error?.message}</Typography><Button onClick={() => refetch()}>Retry</Button></Paper> : (
        <>
          <Box sx={{ position: "relative", ml: 1.5, pl: 3, borderLeft: "2px solid", borderColor: "divider" }}>
            {(data?.items ?? []).map((item) => (
              <Paper key={item._id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, position: "relative" }}>
                <Box sx={{ position: "absolute", width: 10, height: 10, bgcolor: "primary.main", borderRadius: "50%", left: -29, top: 23, outline: "4px solid", outlineColor: "background.default" }} />
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                      <Typography fontWeight={700}>{item.actorName}</Typography>
                      <Chip size="small" label={ACTION_LABELS[item.action] || item.action} color={item.action === "delete" || item.action === "unpublish" ? "warning" : "default"} />
                      <Typography variant="body2" color="text.secondary">{item.resource}{item.resourceId ? ` · ${item.resourceId}` : ""}</Typography>
                    </Stack>
                    <Typography variant="body2">{item.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.method} {item.path}</Typography>
                  </Box>
                  <Box sx={{ textAlign: { sm: "right" }, flexShrink: 0 }}>
                    <Typography variant="body2" fontWeight={600}>{formatDate(item.createdAt)}</Typography>
                    <Typography variant="caption" color="text.secondary">IP: {item.ip || "Unknown"}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
            {!data?.items?.length && <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}><Typography color="text.secondary">No activity matches these filters.</Typography></Paper>}
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">{data?.total ?? 0} audit events</Typography>
            <Stack direction="row" spacing={1} alignItems="center"><Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button><Typography variant="caption">Page {data?.page ?? page} of {data?.totalPages ?? 1}</Typography><Button size="small" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button></Stack>
          </Stack>
        </>
      )}
    </>
  );
}
