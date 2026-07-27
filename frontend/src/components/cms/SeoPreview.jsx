import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import PublicIcon from "@mui/icons-material/Public";

const clampSx = (lines) => ({
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
});

/**
 * Read-only preview widgets for how SEO fields render in a Google
 * search result and in a social share card (OpenGraph/Twitter). Pure
 * presentation — takes already-resolved field values via props, no
 * data fetching of its own, so it re-renders live as the SEO form's
 * `watch()` values change on every keystroke.
 */
export function SerpPreview({ title, description, url }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Box className="flex items-center gap-1.5 mb-1">
        <PublicIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary" noWrap>
          {url || "https://your-portfolio-domain.com"}
        </Typography>
      </Box>
      <Typography sx={{ color: "#1a0dab", fontSize: 20, lineHeight: 1.3, ...clampSx(1) }}>
        {title || "Your meta title will appear here"}
      </Typography>
      <Typography sx={{ color: "#4d5156", fontSize: 14, mt: 0.5, ...clampSx(2) }}>
        {description ||
          "Your meta description will appear here, summarizing the page for search engines."}
      </Typography>
    </Paper>
  );
}

export function SocialCardPreview({ title, description, image, siteName }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box
        sx={{
          aspectRatio: "1.91 / 1",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: image ? `url(${image})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!image && (
          <Typography variant="caption" color="text.disabled">
            No image selected
          </Typography>
        )}
      </Box>
      <Box className="px-3 py-2">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {siteName || "your-portfolio-domain.com"}
        </Typography>
        <Typography fontWeight={700} fontSize={15} sx={clampSx(1)}>
          {title || "Social share title"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={clampSx(2)}>
          {description || "Social share description preview."}
        </Typography>
      </Box>
    </Paper>
  );
}
