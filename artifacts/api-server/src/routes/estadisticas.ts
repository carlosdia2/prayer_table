import { Router, type IRouter } from "express";
import { db, oracionesTable, usuariosTable, comentariosTable, reaccionesTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/estadisticas", async (_req, res): Promise<void> => {
  const [{ totalOraciones }] = await db.select({ totalOraciones: count() }).from(oracionesTable);
  const [{ totalUsuarios }] = await db.select({ totalUsuarios: count() }).from(usuariosTable);
  const [{ totalComentarios }] = await db.select({ totalComentarios: count() }).from(comentariosTable);
  const [{ totalReacciones }] = await db.select({ totalReacciones: count() }).from(reaccionesTable);

  res.json({
    totalOraciones: Number(totalOraciones),
    totalUsuarios: Number(totalUsuarios),
    totalComentarios: Number(totalComentarios),
    totalReacciones: Number(totalReacciones),
  });
});

export default router;
