import { Router, type IRouter } from "express";
import { db, oracionesTable, usuariosTable, reaccionesTable, favoritosTable, comentariosTable } from "@workspace/db";
import { eq, desc, sql, and, ilike, or, count } from "drizzle-orm";

const router: IRouter = Router();

function getCurrentUserId(req: any): number | null {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}

async function buildOracionResponse(oracion: any, autorData: any, usuarioId: number | null) {
  const [{ amenes }] = await db
    .select({ amenes: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracion.id), eq(reaccionesTable.tipo, "amen")));

  const [{ meAyuda }] = await db
    .select({ meAyuda: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracion.id), eq(reaccionesTable.tipo, "me_ayuda")));

  const [{ laRezareHoy }] = await db
    .select({ laRezareHoy: count() })
    .from(reaccionesTable)
    .where(and(eq(reaccionesTable.oracionId, oracion.id), eq(reaccionesTable.tipo, "la_rezare_hoy")));

  const [{ totalFavs }] = await db
    .select({ totalFavs: count() })
    .from(favoritosTable)
    .where(eq(favoritosTable.oracionId, oracion.id));

  const [{ totalComents }] = await db
    .select({ totalComents: count() })
    .from(comentariosTable)
    .where(eq(comentariosTable.oracionId, oracion.id));

  let esFavorito = false;
  let miReaccion = null;

  if (usuarioId) {
    const [fav] = await db
      .select()
      .from(favoritosTable)
      .where(and(eq(favoritosTable.usuarioId, usuarioId), eq(favoritosTable.oracionId, oracion.id)));
    esFavorito = !!fav;

    const [reaccion] = await db
      .select()
      .from(reaccionesTable)
      .where(and(eq(reaccionesTable.usuarioId, usuarioId), eq(reaccionesTable.oracionId, oracion.id)));
    miReaccion = reaccion?.tipo ?? null;
  }

  return {
    id: oracion.id,
    titulo: oracion.titulo,
    texto: oracion.texto,
    categoria: oracion.categoria,
    duracionMinutos: oracion.duracionMinutos ?? null,
    imagen: oracion.imagen ?? null,
    autor: {
      id: autorData.id,
      nombre: autorData.nombre,
      avatar: autorData.avatar ?? null,
    },
    totalAmenes: Number(amenes),
    totalMeAyuda: Number(meAyuda),
    totalLaRezareHoy: Number(laRezareHoy),
    totalFavoritos: Number(totalFavs),
    totalComentarios: Number(totalComents),
    esFavorito,
    miReaccion,
    creadoEn: oracion.creadoEn,
  };
}

router.get("/oraciones/destacadas", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);

  const oraciones = await db
    .select({
      oracion: oracionesTable,
      autor: usuariosTable,
      totalReacciones: count(reaccionesTable.id),
    })
    .from(oracionesTable)
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .leftJoin(reaccionesTable, eq(reaccionesTable.oracionId, oracionesTable.id))
    .groupBy(oracionesTable.id, usuariosTable.id)
    .orderBy(desc(count(reaccionesTable.id)))
    .limit(6);

  const resultado = await Promise.all(
    oraciones.map(({ oracion, autor }) =>
      buildOracionResponse(oracion, autor, usuarioId)
    )
  );

  res.json(resultado);
});

router.get("/oraciones/recientes", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);

  const oraciones = await db
    .select({
      oracion: oracionesTable,
      autor: usuariosTable,
    })
    .from(oracionesTable)
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .orderBy(desc(oracionesTable.creadoEn))
    .limit(6);

  const resultado = await Promise.all(
    oraciones.map(({ oracion, autor }) =>
      buildOracionResponse(oracion, autor, usuarioId)
    )
  );

  res.json(resultado);
});

router.get("/oraciones/categorias", async (_req, res): Promise<void> => {
  const categorias = await db
    .select({
      categoria: oracionesTable.categoria,
      conteo: count(),
    })
    .from(oracionesTable)
    .groupBy(oracionesTable.categoria)
    .orderBy(desc(count()));

  res.json(categorias);
});

router.get("/oraciones", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  const pagina = Math.max(1, parseInt(req.query.pagina as string ?? "1", 10));
  const limite = Math.min(50, parseInt(req.query.limite as string ?? "12", 10));
  const categoria = req.query.categoria as string | undefined;
  const busqueda = req.query.busqueda as string | undefined;
  const offset = (pagina - 1) * limite;

  const whereConditions = [];
  if (categoria) {
    whereConditions.push(eq(oracionesTable.categoria, categoria));
  }
  if (busqueda) {
    whereConditions.push(
      or(
        ilike(oracionesTable.titulo, `%${busqueda}%`),
        ilike(oracionesTable.texto, `%${busqueda}%`)
      )!
    );
  }

  const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(oracionesTable)
    .where(where);

  const oraciones = await db
    .select({
      oracion: oracionesTable,
      autor: usuariosTable,
    })
    .from(oracionesTable)
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .where(where)
    .orderBy(desc(oracionesTable.creadoEn))
    .limit(limite)
    .offset(offset);

  const resultado = await Promise.all(
    oraciones.map(({ oracion, autor }) =>
      buildOracionResponse(oracion, autor, usuarioId)
    )
  );

  res.json({
    oraciones: resultado,
    total: Number(total),
    pagina,
    totalPaginas: Math.ceil(Number(total) / limite),
  });
});

router.post("/oraciones", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const { titulo, texto, categoria, duracionMinutos, imagen } = req.body;

  if (!titulo || !texto || !categoria) {
    res.status(400).json({ error: "Título, texto y categoría son obligatorios" });
    return;
  }

  const [oracion] = await db
    .insert(oracionesTable)
    .values({
      titulo,
      texto,
      categoria,
      duracionMinutos: duracionMinutos ?? null,
      imagen: imagen ?? null,
      autorId: usuarioId,
    })
    .returning();

  const [autor] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.id, usuarioId));

  const resultado = await buildOracionResponse(oracion, autor, usuarioId);
  res.status(201).json(resultado);
});

router.get("/oraciones/:id", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const [oracionData] = await db
    .select({ oracion: oracionesTable, autor: usuariosTable })
    .from(oracionesTable)
    .leftJoin(usuariosTable, eq(oracionesTable.autorId, usuariosTable.id))
    .where(eq(oracionesTable.id, id));

  if (!oracionData) {
    res.status(404).json({ error: "Oración no encontrada" });
    return;
  }

  const base = await buildOracionResponse(oracionData.oracion, oracionData.autor, usuarioId);

  const comentariosData = await db
    .select({ comentario: comentariosTable, autor: usuariosTable })
    .from(comentariosTable)
    .leftJoin(usuariosTable, eq(comentariosTable.usuarioId, usuariosTable.id))
    .where(eq(comentariosTable.oracionId, id))
    .orderBy(desc(comentariosTable.creadoEn));

  const comentarios = comentariosData.map(({ comentario, autor }) => ({
    id: comentario.id,
    texto: comentario.texto,
    autor: {
      id: autor!.id,
      nombre: autor!.nombre,
      avatar: autor!.avatar ?? null,
    },
    creadoEn: comentario.creadoEn,
  }));

  res.json({ ...base, comentarios });
});

router.put("/oraciones/:id", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [oracion] = await db
    .select()
    .from(oracionesTable)
    .where(eq(oracionesTable.id, id));

  if (!oracion) {
    res.status(404).json({ error: "Oración no encontrada" });
    return;
  }

  if (oracion.autorId !== usuarioId) {
    res.status(403).json({ error: "No autorizado" });
    return;
  }

  const { titulo, texto, categoria, duracionMinutos, imagen } = req.body;

  const [updated] = await db
    .update(oracionesTable)
    .set({
      ...(titulo && { titulo }),
      ...(texto && { texto }),
      ...(categoria && { categoria }),
      duracionMinutos: duracionMinutos ?? oracion.duracionMinutos,
      imagen: imagen ?? oracion.imagen,
    })
    .where(eq(oracionesTable.id, id))
    .returning();

  const [autor] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.id, usuarioId));

  const resultado = await buildOracionResponse(updated, autor, usuarioId);
  res.json(resultado);
});

router.delete("/oraciones/:id", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [oracion] = await db
    .select()
    .from(oracionesTable)
    .where(eq(oracionesTable.id, id));

  if (!oracion) {
    res.status(404).json({ error: "Oración no encontrada" });
    return;
  }

  if (oracion.autorId !== usuarioId) {
    res.status(403).json({ error: "No autorizado" });
    return;
  }

  // Eliminar dependencias primero
  await db.delete(reaccionesTable).where(eq(reaccionesTable.oracionId, id));
  await db.delete(favoritosTable).where(eq(favoritosTable.oracionId, id));
  await db.delete(comentariosTable).where(eq(comentariosTable.oracionId, id));
  await db.delete(oracionesTable).where(eq(oracionesTable.id, id));

  res.json({ mensaje: "Oración eliminada" });
});

export default router;
