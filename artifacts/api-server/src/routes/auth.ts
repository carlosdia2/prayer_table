import { Router, type IRouter } from "express";
import passport from "passport";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";
import { hashPassword, verifyPassword } from "../lib/password";

const router: IRouter = Router();
const webBaseUrl = (process.env.FRONTEND_URL ?? process.env.WEB_PUBLIC_URL ?? "/").replace(/\/$/, "");

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

router.post("/auth/email/register", async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const nombre = typeof req.body?.nombre === "string" && req.body.nombre.trim()
    ? req.body.nombre.trim()
    : email.split("@")[0] || "Usuario";

  if (!email || !email.includes("@") || password.length < 8) {
    res.status(400).json({ mensaje: "Introduce un email valido y una contrasena de al menos 8 caracteres." });
    return;
  }

  const [existingUser] = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
  if (existingUser) {
    res.status(409).json({ mensaje: "Ya existe una cuenta con este correo." });
    return;
  }

  const [user] = await db
    .insert(usuariosTable)
    .values({
      googleId: `email:${email}`,
      nombre,
      email,
      passwordHash: await hashPassword(password),
      avatar: null,
    })
    .returning();

  req.login(user, (error) => {
    if (error) {
      req.log.error({ error }, "Error iniciando sesion por correo");
      res.status(500).json({ mensaje: "No se pudo iniciar sesion." });
      return;
    }

    res.status(201).json({
      id: user.id,
      googleId: user.googleId,
      nombre: user.nombre,
      email: user.email,
      avatar: user.avatar ?? null,
      creadoEn: user.creadoEn,
    });
  });
});

router.post("/auth/email/login", async (req, res): Promise<void> => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ mensaje: "Introduce tu correo y contrasena." });
    return;
  }

  const [user] = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ mensaje: "Correo o contrasena incorrectos." });
    return;
  }

  req.login(user, (error) => {
    if (error) {
      req.log.error({ error }, "Error iniciando sesion por correo");
      res.status(500).json({ mensaje: "No se pudo iniciar sesion." });
      return;
    }

    res.json({
      id: user.id,
      googleId: user.googleId,
      nombre: user.nombre,
      email: user.email,
      avatar: user.avatar ?? null,
      creadoEn: user.creadoEn,
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
