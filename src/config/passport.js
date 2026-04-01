import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js"; // ✅ FIX: pakai default import
import { generateToken } from "../utils/jwt.js";

dotenv.config();

// =====================================
// GOOGLE OAUTH STRATEGY (FINAL CLEAN)
// =====================================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ⚠️ pastikan sesuai route kamu
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // =====================================
        // SAFE DATA EXTRACTION
        // =====================================
        const email = profile.emails?.[0]?.value || null;
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email tidak tersedia dari Google"), null);
        }

        // =====================================
        // FIND USER (GOOGLE / EMAIL)
        // =====================================
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: email },
          ],
        });

        // =====================================
        // CREATE USER (IF NOT EXIST)
        // =====================================
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar,
          });
        } else {
          // update user lama jika login pakai Google
          if (!user.googleId) {
            user.googleId = profile.id;
          }

          if (avatar && !user.avatar) {
            user.avatar = avatar;
          }

          await user.save();
        }

        // =====================================
        // GENERATE JWT TOKEN
        // =====================================
        const token = generateToken({
          id: user._id,
          name: user.name,
          email: user.email,
        });

        // =====================================
        // RETURN CLEAN DATA
        // =====================================
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
        return done(error, null);
      }
    }
  )
);

// =====================================
// OPTIONAL (ONLY IF USE SESSION)
// =====================================
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

export default passport;