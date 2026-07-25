import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { ROUTES } from "./routes";
import { PERMISSIONS } from "./permissions";

/**
 * Single source of truth for the admin sidebar AND breadcrumbs. Each
 * node may declare:
 *   - permission: hides the node (and its route, when combined with
 *     <RequirePermission>) unless the admin has that permission
 *   - hidden: excluded from the sidebar, but still resolvable by
 *     useBreadcrumbs — for routes reachable via a button/link rather
 *     than a nav row (e.g. "Add Project")
 *   - children: nested routes; Sidebar renders them as a collapsible
 *     group, useBreadcrumbs walks the full parent chain
 *
 * Nothing about the sidebar or breadcrumb trail is hand-written per
 * page — both are derived entirely from this tree.
 */
export const ADMIN_NAV_TREE = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: ROUTES.adminDashboard,
    icon: DashboardOutlinedIcon,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    id: "profile",
    label: "Profile",
    path: ROUTES.adminProfile,
    icon: PersonOutlineIcon,
    permission: PERMISSIONS.PROFILE_EDIT,
  },
  {
    id: "about",
    label: "About",
    path: ROUTES.adminAbout,
    icon: InfoOutlinedIcon,
    permission: PERMISSIONS.ABOUT_EDIT,
  },
  {
    id: "projects",
    label: "Projects",
    path: ROUTES.adminProjects,
    icon: WorkOutlineIcon,
    permission: PERMISSIONS.PROJECTS_VIEW,
    children: [
      {
        id: "projects-new",
        label: "Add Project",
        path: ROUTES.adminProjectsNew,
        permission: PERMISSIONS.PROJECTS_CREATE,
        hidden: true,
      },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    path: ROUTES.adminCategories,
    icon: CategoryOutlinedIcon,
    permission: PERMISSIONS.CATEGORIES_VIEW,
  },
  {
    id: "resume",
    label: "Resume",
    path: ROUTES.adminResume,
    icon: DescriptionOutlinedIcon,
    permission: PERMISSIONS.RESUME_EDIT,
  },
  {
    id: "messages",
    label: "Messages",
    path: ROUTES.adminMessages,
    icon: MailOutlineIcon,
    permission: PERMISSIONS.MESSAGES_VIEW,
  },
];

/** Depth-first flatten, including hidden nodes — used by breadcrumb resolution. */
export function flattenNavTree(nodes = ADMIN_NAV_TREE) {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNavTree(node.children) : [])]);
}
