import { Router, type IRouter } from "express";
import { db, reaccionesTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

const router: IRouter = Router();

function getCurrentUserId(req: any): number | null {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}

const TIPOS_VALIDOS = ["amen", "me_ayuda", "la_rezare_hoy"];

router.post("/oraciones/:id/reaccionar", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oracionId = parseInt(raw, 10);

  const { tipo } = req.body;

  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    res.status(400).json({ error: "Tipo de reacción inválido" });
    return;
  }

  const [existing] = await db
    .select()
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.usuarioId, usuarioId), eq(reaccionesTable.oracionId, oracionId)));

  let tipoFinal: string | null = tipo;

  if (existing) {
    if (existing.tipo === tipo) {
      // Quitar la reacción (toggle)
      await db
        .delete(reaccionesTable)
        .where(and(eq(reaccionesTable.usuarioId, usuarioId), eq(reaccionesTable.oracionId, oracionId)));
      tipoFinal = null;
    } else {
      // Cambiar tipo de reacción
      await db
        .update(reaccionesTable)
        .set({ tipo })
        .where(and(eq(reaccionesTable.usuarioId, usuarioId), eq(reaccionesTable.oracionId, oracionId)));
    }
  } else {
    await db
      .insert(reaccionesTable)
      .values({ tipo, usuarioId, oracionId });
  }

  const [{ amenes }] = await db
    .select({ amenes: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracionId), eq(reaccionesTable.tipo, "amen")));

  const [{ meAyuda }] = await db
    .select({ meAyuda: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracionId), eq(reaccionesTable.tipo, "me_ayuda")));

  const [{ laRezareHoy }] = await db
    .select({ laRezareHoy: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracionId), eq(reaccionesTable.tipo, "la_rezare_hoy")));

  res.json({
    tipo: tipoFinal,
    mensaje: tipoFinal ? "Reacción registrada" : "Reacción eliminada",
    totalAmenes: Number(amenes),
    totalMeAyuda: Number(meAyuda),
    totalLaRezareHoy: Number(laRezareHoy),
  });
});

export default router;
