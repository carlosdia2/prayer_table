import { Router, type IRouter } from "express";
import passport from "passport";

const router: IRouter = Router();
const webBaseUrl = (process.env.WEB_PUBLIC_URL ?? "/").replace(/\/$/, "");

router.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ error: "Login con Google no configurado. Por favor, añade las credenciales de Google OAuth." });
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    if (req.query.error) {
      res.redirect(`${webBaseUrl || ""}/?error=login_cancelado`);
      return;
    }
    passport.authenticate("google", {
      failureRedirect: `${webBaseUrl || ""}/login?error=fallo_login`,
    })(req, res, next);
  },
  (_req, res) => {
    res.redirect(`${webBaseUrl || ""}/`);
  }
);

router.post("/auth/logout", (req, res): void => {
  req.logout((err) => {
    if (err) {
      req.log.error({ err }, "Error al cerrar sesión");
      res.status(500).json({ mensaje: "Error al cerrar sesión" });
      return;
    }
    req.session.destroy(() => {
      res.json({ mensaje: "Sesión cerrada correctamente" });
    });
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ mensaje: "No autenticado" });
    return;
  }
  const user = req.user as any;
  res.json({
    id: user.id,
    googleId: user.googleId,
    nombre: user.nombre,
    email: user.email,
    avatar: user.avatar ?? null,
    creadoEn: user.creadoEn,
  });
});

export default router;
