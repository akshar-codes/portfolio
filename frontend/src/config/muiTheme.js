import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212", // ~ hsl(0, 0%, 7%) smoky-black
      paper: "#1e1e1e", // ~ hsl(240, 2%, 12%) eerie-black-2
    },
    primary: {
      main: "#ffd873", // ~ hsl(45, 100%, 72%) orange-yellow-crayola
      contrastText: "#121212",
    },
    error: {
      main: "#d6534a", // ~ hsl(0, 43%, 51%) bittersweet-shimmer
    },
    text: {
      primary: "#fafafa", // white-2
      secondary: "#d6d6d6", // light-gray
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  shape: {
    borderRadius: 14,
  },
});
