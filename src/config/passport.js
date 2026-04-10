import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
import { generateToken } from "../helpers/token.js";

dotenv.config();

// VERIFIKASI ENV SAAT STARTUP
const requiredEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "JWT_SECRET"];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
     console.error(`❌ CRITICAL ENV MISSING: ${key}`);
  } else {
     console.log(`✅ ENV LOADED: ${key} (exists)`);
  }
});

// FORCED REDIRECT URI FOR NGROK
const googleCallbackUrl = "https://unvicarious-camelia-porky.ngrok-free.dev/api/auth/google/callback";

console.log(`✅ HIGH PRIORITY CALLBACK URI: ${googleCallbackUrl}`);

// =====================================
// GOOGLE OAUTH STRATEGY (FINAL CLEAN)
// =====================================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
      proxy: true,
    },

    async (accessToken, refreshToken, profile, done) => {
      console.log("🔵 Google OAuth verify callback triggered");
      console.log("📄 Profile from Google:", JSON.stringify(profile, null, 2));

      try {
        const email = profile.emails?.[0]?.value || null;
        console.log(`📧 Resolved Email: ${email}`);
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          console.error("❌ Email missing from Google Profile");
          return done(new Error("Email not available from Google"), null);
        }

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: email },
          ],
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar,
          });
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          if (avatar && !user.avatar) {
            user.avatar = avatar;
          }
          await user.save();
        }

        const token = generateToken({
          id: user._id,
          name: user.name,
          email: user.email,
        });

        return done(null, {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
          token,
        });

      } catch (error) {
        console.error("❌ Google OAuth Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

console.log(`✅ Google callback URL set to: ${googleCallbackUrl}`);

// =====================================
// OPTIONAL (ONLY IF USE SESSION)
// =====================================
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

export default passport;