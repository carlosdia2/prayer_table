import { pgTable, text, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";
import { oracionesTable } from "./oraciones";

export const reaccionesTable = pgTable("reacciones", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(), // 'amen' | 'me_ayuda' | 'la_rezare_hoy'
  usuarioId: integer("usuario_id").notNull().references(() => usuariosTable.id),
  oracionId: integer("oracion_id").notNull().references(() => oracionesTable.id),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  unicaReaccion: unique().on(table.usuarioId, table.oracionId),
}));

export const insertReaccionSchema = createInsertSchema(reaccionesTable).omit({ id: true, creadoEn: true });
export type InsertReaccion = z.infer<typeof insertReaccionSchema>;
export type Reaccion = typeof reaccionesTable.$inferSelect;
