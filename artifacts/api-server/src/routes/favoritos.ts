import { Router, type IRouter } from "express";
import { db, favoritosTable, oracionesTable, usuariosTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

function getCurrentUserId(req: any): number | null {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}

router.post("/oraciones/:id/favorito", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oracionId = parseInt(raw, 10);

  const [existing] = await db
    .select()
    .from(favoritosTable)
    .where(and(eq(favoritosTable.usuarioId, usuarioId), eq(favoritosTable.oracionId, oracionId)));

  if (existing) {
    await db
      .delete(favoritosTable)
      .where(and(eq(favoritosTable.usuarioId, usuarioId), eq(favoritosTable.oracionId, oracionId)));
    res.json({ esFavorito: false, mensaje: "Eliminado de favoritos" });
  } else {
    await db
      .insert(favoritosTable)
      .values({ usuarioId, oracionId });
    res.json({ esFavorito: true, mensaje: "Añadido a favoritos" });
  }
});

router.get("/favoritos", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const favs = await db
    .select({ oracion: oracionesTable, autor: usuariosTable })
    .from(favoritosTable)
    .leftJoin(oracionesTable, eq(favoritosTable.oracionId, oracionesTable.id))
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .where(eq(favoritosTable.usuarioId, usuarioId))
    .orderBy(desc(favoritosTable.creadoEn));

  const resultado = favs.map(({ oracion, autor }) => ({
    id: oracion!.id,
    titulo: oracion!.titulo,
    texto: oracion!.texto,
    categoria: oracion!.categoria,
    duracionMinutos: oracion!.duracionMinutos ?? null,
    imagen: oracion!.imagen ?? null,
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
    esFavorito: true,
    miReaccion: null,
    creadoEn: oracion!.creadoEn,
  }));

  res.json(resultado);
});

export default router;
