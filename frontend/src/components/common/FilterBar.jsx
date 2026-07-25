import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

/**
 * Generic row of dropdown filters. `filters`: [{ label, value, onChange, options: [{label, value}] }]
 * Kept separate from Toolbar so it can be reused standalone (e.g. above
 * a card grid that has no search box).
 */
export default function FilterBar({ filters = [] }) {
  if (filters.length === 0) return null;

  return (
    <Box className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <FormControl key={f.label} size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{f.label}</InputLabel>
          <Select label={f.label} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
            {f.options.map((opt) => (
              <MenuItem key={String(opt.value)} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  );
}
