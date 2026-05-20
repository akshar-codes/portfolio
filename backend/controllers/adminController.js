import {
  attemptLogin,
  getVerifiedPayload,
  getCookieOptions,
  getClearCookieOptions,
  COOKIE_NAME,
  ServiceError,
} from "../services/authService.js";

/* ---------------------------------------------------------------
   POST /api/admin/login
--------------------------------------------------------------- */
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const token = await attemptLogin(username, password);

    res.cookie(COOKIE_NAME, token, getCookieOptions());
    return res.json({ message: "Login successful" });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("[loginAdmin]", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------------
   GET /api/admin/verify
--------------------------------------------------------------- */
export const verifyAdmin = (req, res) => {
  return res.json(getVerifiedPayload(req.admin));
};

/* ---------------------------------------------------------------
   POST /api/admin/logout
--------------------------------------------------------------- */
export const logoutAdmin = (req, res) => {
  res.clearCookie(COOKIE_NAME, getClearCookieOptions());
  return res.json({ message: "Logged out successfully" });
};
