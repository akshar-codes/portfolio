import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient";
import App from "./App";
import "./styles/public.css";

const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ff88",
      dark: "#00cc6a",
      contrastText: "#1c1c1e",
    },
    background: {
      default: "#1c1c1e",
      paper: "#252527",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a0a0a0",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2a2a2d",
            borderRadius: "8px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.85rem",
            "& fieldset": {
              borderColor: "#3a3a3d",
            },
            "&:hover fieldset": {
              borderColor: "#00ff88",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00ff88",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#6b6b6e",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.85rem",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#00ff88",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a2d",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.85rem",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.85rem",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
