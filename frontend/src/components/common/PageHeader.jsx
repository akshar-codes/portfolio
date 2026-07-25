import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <Box className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <Box>
        <Box className="flex items-center gap-2">
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          {badge}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" className="mt-1 max-w-2xl">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box className="flex items-center gap-2 flex-wrap">{actions}</Box>}
    </Box>
  );
}
