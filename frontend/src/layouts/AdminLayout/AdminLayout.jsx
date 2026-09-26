import { useState } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import MobileDrawer, { SIDEBAR_WIDTH } from "./MobileDrawer";
import Header from "./Header";
import PageContainer from "./PageContainer";
import Footer from "./Footer";
import MessageNotificationWatcher from "../../components/notifications/MessageNotificationWatcher";
import GlobalSearch from "../../components/common/GlobalSearch";
import { useAdminStyles } from "../../hooks/useAdminStyles";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";
import { useGlobalSearch } from "../../hooks/useGlobalSearch";

export default function AdminLayout() {
  useAdminStyles();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trail = useBreadcrumbs();
  const pageTitle = trail[trail.length - 1]?.label ?? "Dashboard";

  // Registers the window-level Cmd+K listener and owns the open state
  const { isOpen, close } = useGlobalSearch();

  return (
    <>
      <MessageNotificationWatcher />
      <GlobalSearch open={isOpen} onClose={close} />
      <a className="skip-link" href="#admin-main-content">Skip to main content</a>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{pageTitle}</span>

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        {isDesktop && (
          <Box
            component="nav"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflowY: "auto",
            }}
            aria-label="Admin navigation"
          >
            <Sidebar />
          </Box>
        )}

        <MobileDrawer open={!isDesktop && mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box component="main" id="admin-main-content" tabIndex={-1} sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Header onMenuClick={() => setMobileOpen((open) => !open)} pageTitle={pageTitle} menuOpen={mobileOpen} />
          <PageContainer>
            <Outlet />
          </PageContainer>
          <Footer />
        </Box>
      </Box>
    </>
  );
}
