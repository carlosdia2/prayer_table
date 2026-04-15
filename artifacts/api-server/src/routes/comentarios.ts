import { Router, type IRouter } from "express";
import { db, comentariosTable, usuariosTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

function getCurrentUserId(req: any): number | null {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return (req.user as any).id;
  }
  return null;
}

router.get("/oraciones/:id/comentarios", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oracionId = parseInt(raw, 10);

  const comentariosData = await db
    .select({ comentario: comentariosTable, autor: usuariosTable })
    .from(comentariosTable)
    .leftJoin(usuariosTable, eq(comentariosTable.usuarioId, usuariosTable.id))
    .where(eq(comentariosTable.oracionId, oracionId))
    .orderBy(desc(comentariosTable.creadoEn));

  const resultado = comentariosData.map(({ comentario, autor }) => ({
    id: comentario.id,
    texto: comentario.texto,
    autor: {
      id: autor!.id,
      nombre: autor!.nombre,
      avatar: autor!.avatar ?? null,
    },
    creadoEn: comentario.creadoEn,
  }));

  res.json(resultado);
});

router.post("/oraciones/:id/comentarios", async (req, res): Promise<void> => {
  const usuarioId = getCurrentUserId(req);
  if (!usuarioId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const oracionId = parseInt(raw, 10);

  const { texto } = req.body;

  if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
    res.status(400).json({ error: "El comentario no puede estar vacío" });
    return;
  }

  const [comentario] = await db
    .insert(comentariosTable)
    .values({ texto: texto.trim(), usuarioId, oracionId })
    .returning();

  const [autor] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.id, usuarioId));

  res.status(201).json({
    id: comentario.id,
    texto: comentario.texto,
    autor: {
      id: autor.id,
      nombre: autor.nombre,
      avatar: autor.avatar ?? null,
    },
    creadoEn: comentario.creadoEn,
  });
});

export default router;
