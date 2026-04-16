import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import passport from "passport";
import { logger } from "./lib/logger";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const router = hasDatabase
  ? (await import("./routes")).default
  : (await import("./routes/demo")).default;

if (hasDatabase) {
  await import("./lib/passport");
} else {
  logger.warn("DATABASE_URL no configurado. Usando API demo en memoria para desarrollo local.");
}

const app: Express = express();
app.set("trust proxy", 1);

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : true;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET ?? "mesa-de-oracion-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.SESSION_COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) ?? "lax",
    domain: process.env.SESSION_COOKIE_DOMAIN,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

if (hasDatabase) {
  app.use(passport.initialize());
  app.use(passport.session());
}

app.use("/api", router);

export default app;
