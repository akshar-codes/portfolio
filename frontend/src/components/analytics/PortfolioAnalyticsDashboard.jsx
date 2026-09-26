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
import CircularProgress from "@mui/material/CircularProgress";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

const METRICS = [
  ["visitors", "Visitors", "#6750a4"],
  ["sessions", "Sessions", "#00897b"],
  ["downloads", "Downloads", "#ef6c00"],
  ["contactRequests", "Contact requests", "#1976d2"],
  ["projectViews", "Project views", "#c2185b"],
];
const GRANULARITIES = ["daily", "weekly", "monthly", "yearly"];

function dateInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function MetricChart({ series, granularity }) {
  const width = 800;
  const height = 260;
  const padding = { top: 14, right: 14, bottom: 28, left: 34 };
  const values = series.flatMap((row) => METRICS.map(([key]) => row[key] || 0));
  const max = Math.max(1, ...values);
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const pointsFor = (key) => series.map((row, index) => {
    const x = padding.left + (series.length <= 1 ? plotW / 2 : index * plotW / (series.length - 1));
    const y = padding.top + plotH - ((row[key] || 0) / max) * plotH;
    return `${x},${y}`;
  }).join(" ");
  const labelAt = (index) => {
    const d = new Date(series[index]?.date);
    if (Number.isNaN(d.getTime())) return "";
    if (granularity === "yearly") return d.toLocaleDateString(undefined, { year: "numeric" });
    if (granularity === "monthly") return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Portfolio traffic and conversion chart">
        {[0, 0.5, 1].map((fraction) => {
          const y = padding.top + plotH * fraction;
          return <g key={fraction}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" opacity="0.12" /><text x={padding.left - 7} y={y + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.6">{Math.round(max * (1 - fraction))}</text></g>;
        })}
        {METRICS.map(([key, , color]) => <polyline key={key} points={pointsFor(key)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />)}
        {series.length > 0 && [0, Math.floor((series.length - 1) / 2), series.length - 1].map((index) => <text key={index} x={padding.left + (series.length <= 1 ? plotW / 2 : index * plotW / (series.length - 1))} y={height - 5} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">{labelAt(index)}</text>)}
      </svg>
      <Stack direction="row" gap={2} flexWrap="wrap" sx={{ px: 1 }}>
        {METRICS.map(([, label, color]) => <Stack key={label} direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: color }} /><Typography variant="caption">{label}</Typography></Stack>)}
      </Stack>
    </Box>
  );
}

function RankedList({ title, rows, nameField, valueField }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>{title}</Typography>
      {rows?.length ? rows.map((row, index) => (
        <Stack key={`${row[nameField]}-${index}`} direction="row" justifyContent="space-between" gap={2} sx={{ py: 1, borderBottom: index < rows.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
          <Typography variant="body2" noWrap>{index + 1}. {row[nameField]}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>{row[valueField].toLocaleString()}</Typography>
        </Stack>
      )) : <Typography variant="body2" color="text.secondary">No data for this period.</Typography>}
    </Paper>
  );
}

export default function PortfolioAnalyticsDashboard() {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 29);
  const [from, setFrom] = useState(dateInput(monthAgo));
  const [to, setTo] = useState(dateInput(today));
  const [granularity, setGranularity] = useState("daily");
  const [exporting, setExporting] = useState(false);
  const params = useMemo(() => ({
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
    granularity,
  }), [from, to, granularity]);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "portfolioAnalytics", params],
    queryFn: () => api.get(API_ENDPOINTS.adminPortfolioAnalytics, { params }).then((res) => res.data),
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data: blob } = await api.get(API_ENDPOINTS.adminPortfolioAnalyticsExport, { params, responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "portfolio-analytics.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) { toast.error(err.message || "Could not export analytics."); }
    finally { setExporting(false); }
  };

  const totals = data?.totals ?? {};
  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1.5} sx={{ mb: 2 }}>
        <Box><Typography variant="h5" fontWeight={700}>Portfolio analytics</Typography><Typography variant="body2" color="text.secondary">First-party traffic and engagement for published pages.</Typography></Box>
        <Button variant="outlined" startIcon={exporting ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />} onClick={exportCsv} disabled={exporting}>Export CSV</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={1.5}>
          <TextField size="small" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" select label="Chart interval" value={granularity} onChange={(e) => setGranularity(e.target.value)} sx={{ minWidth: 150 }}>{GRANULARITIES.map((value) => <MenuItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</MenuItem>)}</TextField>
        </Stack>
      </Paper>

      {isLoading ? <Box className="flex justify-center py-12"><CircularProgress /></Box> : isError ? <Paper variant="outlined" sx={{ p: 3, mb: 2 }}><Typography color="error" sx={{ mb: 1 }}>{error?.message}</Typography><Button onClick={() => refetch()}>Retry</Button></Paper> : <>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(5,1fr)" }, gap: 1.5, mb: 2.5 }}>
          {METRICS.map(([key, label, color]) => <Paper key={key} variant="outlined" sx={{ p: 2, borderRadius: 3, borderTop: 3, borderTopColor: color }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={700}>{(totals[key] ?? 0).toLocaleString()}</Typography></Paper>)}
        </Box>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2.5 }, mb: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Traffic over time</Typography>
          {data?.series?.length ? <MetricChart series={data.series} granularity={granularity} /> : <Typography color="text.secondary" sx={{ py: 8, textAlign: "center" }}>No analytics recorded in this date range yet.</Typography>}
        </Paper>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 2 }}>
          <RankedList title="Popular projects" rows={data?.popularProjects} nameField="title" valueField="views" />
          <RankedList title="Popular technologies" rows={data?.popularTechnologies} nameField="technology" valueField="views" />
          <RankedList title="Referrers" rows={data?.referrers} nameField="referrer" valueField="visits" />
        </Box>
      </>}
    </Box>
  );
}
