import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const oracionesTable = pgTable("oraciones", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  texto: text("texto").notNull(),
  categoria: text("categoria").notNull(),
  duracionMinutos: integer("duracion_minutos"),
  imagen: text("imagen"),
  autorId: integer("autor_id").notNull().references(() => usuariosTable.id),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOracionSchema = createInsertSchema(oracionesTable).omit({ id: true, creadoEn: true, actualizadoEn: true });
export type InsertOracion = z.infer<typeof insertOracionSchema>;
export type Oracion = typeof oracionesTable.$inferSelect;
