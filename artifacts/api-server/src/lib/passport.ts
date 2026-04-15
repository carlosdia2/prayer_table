import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db, usuariosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost";
  const callbackURL = process.env.NODE_ENV === "production"
    ? `https://${domains}/api/auth/google/callback`
    : `http://localhost/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const nombre = profile.displayName ?? "Usuario";
          const email = profile.emails?.[0]?.value ?? "";
          const avatar = profile.photos?.[0]?.value ?? null;

          const [existingUser] = await db
            .select()
            .from(usuariosTable)
            .where(eq(usuariosTable.googleId, googleId));

          if (existingUser) {
            return done(null, existingUser);
          }

          const [newUser] = await db
            .insert(usuariosTable)
            .values({ googleId, nombre, email, avatar })
            .returning();

          return done(null, newUser);
        } catch (err) {
          logger.error({ err }, "Error en autenticación con Google");
          return done(err as Error);
        }
      }
    )
  );
} else {
  logger.warn("GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no configurados. El login con Google no estará disponible.");
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.id, id));
    done(null, user ?? null);
  } catch (err) {
    done(err);
  }
});
