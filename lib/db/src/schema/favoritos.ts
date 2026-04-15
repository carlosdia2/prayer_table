import { pgTable, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";
import { oracionesTable } from "./oraciones";

export const favoritosTable = pgTable("favoritos", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id").notNull().references(() => usuariosTable.id),
  oracionId: integer("oracion_id").notNull().references(() => oracionesTable.id),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  unicoFavorito: unique().on(table.usuarioId, table.oracionId),
}));

export const insertFavoritoSchema = createInsertSchema(favoritosTable).omit({ id: true, creadoEn: true });
export type InsertFavorito = z.infer<typeof insertFavoritoSchema>;
export type Favorito = typeof favoritosTable.$inferSelect;
