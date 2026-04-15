import { db, usuariosTable, oracionesTable, comentariosTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./logger";

export async function seedIfEmpty() {
  const [{ total }] = await db.select({ total: count() }).from(oracionesTable);

  if (Number(total) > 0) {
    return;
  }

  logger.info("Sembrando datos de ejemplo...");

  const [autor] = await db
    .insert(usuariosTable)
    .values({
      googleId: "seed-user-001",
      nombre: "Hermano Sebastián",
      email: "sebastian@mesadeoracion.app",
      avatar: null,
    })
    .onConflictDoNothing()
    .returning();

  if (!autor) {
    logger.info("Datos de ejemplo ya existen");
    return;
  }

  const oraciones = [
    {
      titulo: "Oración por la paz interior",
      texto: "Señor, concédeme la serenidad para aceptar las cosas que no puedo cambiar, el valor para cambiar las cosas que puedo, y la sabiduría para reconocer la diferencia. Que tu paz, que sobrepasa todo entendimiento, guarde mi corazón y mi mente en Cristo Jesús. Amén.",
      categoria: "Serenidad",
      duracionMinutos: 3,
    },
    {
      titulo: "Salmo de la mañana",
      texto: "Al amanecer, Señor, escuchas mi voz; al amanecer te presento mi oración, y quedo a la espera. Que tu misericordia me rodee, pues en ti confío. Tú eres mi refugio y mi fortaleza, mi Dios, en quien confío.",
      categoria: "Salmo",
      duracionMinutos: 5,
    },
    {
      titulo: "Intercesión por los enfermos",
      texto: "Padre misericordioso, elevo ante ti a todos los que sufren enfermedades del cuerpo y del alma. Que tu mano sanadora los toque, que tu consuelo llene sus corazones. Dales paciencia en el sufrimiento, esperanza en la oscuridad y fe en tu amor infinito.",
      categoria: "Intercesión",
      duracionMinutos: 4,
    },
    {
      titulo: "Acción de gracias al Creador",
      texto: "Gracias, Señor, por el regalo de este día. Por el aire que respiro, por los que me aman, por las pequeñas maravillas que a menudo no veo. Que nunca dé por sentado ninguna de tus bendiciones. Que mi vida entera sea una oración de gratitud.",
      categoria: "Acción de gracias",
      duracionMinutos: 3,
    },
    {
      titulo: "Oración de contrición",
      texto: "Señor mío Jesucristo, Dios y Hombre verdadero, me pesa de todo corazón haberte ofendido, porque eres infinitamente bueno y porque el pecado te desagrada. Propongo firmemente, con tu gracia, enmendarme y alejarme de las ocasiones de pecar.",
      categoria: "Contrición",
      duracionMinutos: 5,
    },
    {
      titulo: "Novena a la Virgen María",
      texto: "Oh María, sin pecado concebida, ruega por nosotros que recurrimos a ti. Madre de misericordia, en este tiempo de necesidad acudimos a tu maternal intercesión. Ampara a tu pueblo fiel que a ti clama, socorre al que sufre y guía al que se pierde.",
      categoria: "Novena",
      duracionMinutos: 10,
    },
  ];

  for (const oracion of oraciones) {
    const [created] = await db
      .insert(oracionesTable)
      .values({ ...oracion, autorId: autor.id })
      .returning();

    if (created.id === 1) {
      await db.insert(comentariosTable).values([
        { texto: "Esta oración me ha acompañado en momentos muy difíciles. Gracias por compartirla.", usuarioId: autor.id, oracionId: created.id },
        { texto: "Que Dios os bendiga. La rezo cada mañana.", usuarioId: autor.id, oracionId: created.id },
      ]);
    }
  }

  logger.info("Datos de ejemplo sembrados correctamente");
}
