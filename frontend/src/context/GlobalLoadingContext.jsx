/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const GlobalLoadingContext = createContext(null);

/**
 * App-wide blocking overlay for operations that must prevent further
 * interaction (e.g. a bulk delete fanning out across many rows). Most
 * async UI should prefer local loading states — a button spinner,
 * DataTable's `fetching` indicator — reach for this only when the
 * whole screen genuinely needs to be blocked.
 */
export function GlobalLoadingProvider({ children }) {
  const [state, setState] = useState({ active: false, message: "" });

  const showLoading = useCallback((message = "Loading…") => {
    setState({ active: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setState({ active: false, message: "" });
  }, []);

  const value = useMemo(() => ({ ...state, showLoading, hideLoading }), [state, showLoading, hideLoading]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      <Backdrop open={state.active} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: "#fff" }}>
        <Box className="flex flex-col items-center gap-3">
          <CircularProgress color="inherit" />
          {state.message && <Typography variant="body2">{state.message}</Typography>}
        </Box>
      </Backdrop>
    </GlobalLoadingContext.Provider>
  );
}
