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
import { useAdminStyles } from "../../hooks/useAdminStyles";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";

export default function AdminLayout() {
  // Legacy admin.css stays loaded so pages not yet migrated onto this
  // component library (ManageProjects, ManageResume, ManageAbout,
  // ManageProfile, Messages, Dashboard) keep their existing styling
  // untouched. New components below never depend on it — safe to
  // delete this line (and the stylesheet) once every admin page has
  // been migrated.
  useAdminStyles();

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trail = useBreadcrumbs();
  const pageTitle = trail[trail.length - 1]?.label ?? "Dashboard";

  return (
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
        >
          <Sidebar />
        </Box>
      )}

      <MobileDrawer open={!isDesktop && mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <PageContainer>
          <Outlet />
        </PageContainer>
        <Footer />
      </Box>
    </Box>
  );
}
