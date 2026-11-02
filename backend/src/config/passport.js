import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findSoleAdmin } from "../repositories/adminRepository.js";

const callbackURL = process.env.GOOGLE_CALLBACK_URL?.trim();
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  callbackURL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        scope: ["email", "profile"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails
            ?.find((entry) => String(entry.verified).toLowerCase() === "true")
            ?.value?.trim()
            .toLowerCase();
          const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
          if (!email || !adminEmail || email !== adminEmail)
            return done(null, false);
          const admin = await findSoleAdmin();
          return done(null, admin || false);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );
}

export default passport;
