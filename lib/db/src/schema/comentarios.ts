import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";
import { oracionesTable } from "./oraciones";

export const comentariosTable = pgTable("comentarios", {
  id: serial("id").primaryKey(),
  texto: text("texto").notNull(),
  usuarioId: integer("usuario_id").notNull().references(() => usuariosTable.id),
  oracionId: integer("oracion_id").notNull().references(() => oracionesTable.id),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

export const insertComentarioSchema = createInsertSchema(comentariosTable).omit({ id: true, creadoEn: true });
export type InsertComentario = z.infer<typeof insertComentarioSchema>;
export type Comentario = typeof comentariosTable.$inferSelect;
