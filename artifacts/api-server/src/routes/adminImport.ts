import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, oracionesTable, usuariosTable } from "@workspace/db";
import { parseOracionesCsv } from "../lib/oracionesCsv";

const router: IRouter = Router();

const ADMIN_AUTHOR_EMAIL = "admin@monakus.local";
const ADMIN_AUTHOR_NAME = "MONAKUS";

// TODO: protect this route with an admin role before opening the app to real users.
router.post("/admin/oraciones/import-csv", async (req, res) => {
  try {
    const csv = typeof req.body?.csv === "string" ? req.body.csv : "";
    const allowDuplicates = Boolean(req.body?.allowDuplicates);

    if (!csv.trim()) {
      res.status(400).json({ mensaje: "Sube un CSV con titulo, texto y categoria." });
      return;
    }

    const oracionesCsv = parseOracionesCsv(csv);

    const [existingAuthor] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.email, ADMIN_AUTHOR_EMAIL))
      .limit(1);

    const author =
      existingAuthor ??
      (
        await db
          .insert(usuariosTable)
          .values({
            googleId: `internal:csv-importer:${ADMIN_AUTHOR_EMAIL}`,
            nombre: ADMIN_AUTHOR_NAME,
            email: ADMIN_AUTHOR_EMAIL,
            avatar: null,
          })
          .returning()
      )[0];

    let insertadas = 0;
    let omitidas = 0;

    for (const oracion of oracionesCsv) {
      if (!allowDuplicates) {
        const [duplicate] = await db
          .select({ id: oracionesTable.id })
          .from(oracionesTable)
          .where(
            and(
              eq(oracionesTable.titulo, oracion.titulo),
              eq(oracionesTable.categoria, oracion.categoria),
            ),
          )
          .limit(1);

        if (duplicate) {
          omitidas += 1;
          continue;
        }
      }

      await db.insert(oracionesTable).values({
        titulo: oracion.titulo,
        texto: oracion.texto,
        categoria: oracion.categoria,
        autorId: author.id,
        duracionMinutos: null,
        imagen: null,
      });
      insertadas += 1;
    }

    res.status(201).json({
      total: oracionesCsv.length,
      insertadas,
      omitidas,
      categorias: [...new Set(oracionesCsv.map((oracion) => oracion.categoria))],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo importar el CSV.";
    res.status(400).json({ mensaje: message });
  }
});

export default router;
