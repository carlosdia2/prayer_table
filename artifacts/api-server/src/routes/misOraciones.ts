import { Router, type IRouter } from "express";
import { db, oracionesTable, usuariosTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

function getCurrentUserId(req: any): number | null {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}

router.get("/mis-oraciones", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const oraciones = await db
    .select({ oracion: oracionesTable, autor: usuariosTable })
    .from(oracionesTable)
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .where(eq(oracionesTable.autorId, usuarioId))
    .orderBy(desc(oracionesTable.creadoEn));

  const resultado = oraciones.map(({ oracion, autor }) => ({
    id: oracion.id,
    titulo: oracion.titulo,
    texto: oracion.texto,
    categoria: oracion.categoria,
    duracionMinutos: oracion.duracionMinutos ?? null,
    imagen: oracion.imagen ?? null,
    autor: {
      id: autor!.id,
      nombre: autor!.nombre,
      avatar: autor!.avatar ?? null,
    },
    totalAmenes: 0,
    totalMeAyuda: 0,
    totalLaRezareHoy: 0,
    totalFavoritos: 0,
    totalComentarios: 0,
    esFavorito: false,
    miReaccion: null,
    creadoEn: oracion.creadoEn,
  }));

  res.json(resultado);
});

export default router;
