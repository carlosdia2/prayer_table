import { Router, type IRouter } from "express";
import { parseOracionesCsv } from "../lib/oracionesCsv";

type DemoUser = {
  id: number;
  googleId: string;
  nombre: string;
  email: string;
  password: string | null;
  avatar: string | null;
  creadoEn: string;
};

type DemoOracion = {
  id: number;
  titulo: string;
  texto: string;
  categoria: string;
  duracionMinutos: number | null;
  imagen: string | null;
  autor: Pick<DemoUser, "id" | "nombre" | "avatar">;
  totalAmenes: number;
  totalMeAyuda: number;
  totalLaRezareHoy: number;
  totalFavoritos: number;
  totalComentarios: number;
  esFavorito: boolean;
  miReaccion: string | null;
  creadoEn: string;
};

type DemoComentario = {
  id: number;
  texto: string;
  autor: Pick<DemoUser, "id" | "nombre" | "avatar">;
  creadoEn: string;
};

const router: IRouter = Router();
const now = new Date().toISOString();

const demoUser: DemoUser = {
  id: 1,
  googleId: "demo-user",
  nombre: "Hermano Sebastian",
  email: "demo@mesadeoracion.local",
  password: "monakusdemo",
  avatar: null,
  creadoEn: now,
};

let nextOracionId = 7;
let nextComentarioId = 3;
let nextUserId = 2;
const users: DemoUser[] = [demoUser];
let currentDemoUser: DemoUser | null = null;

const oraciones: DemoOracion[] = [
  {
    id: 1,
    titulo: "Oracion por la paz interior",
    texto:
      "Senor, concedeme la serenidad para aceptar las cosas que no puedo cambiar, el valor para cambiar las cosas que puedo, y la sabiduria para reconocer la diferencia. Que tu paz guarde mi corazon.",
    categoria: "Serenidad",
    duracionMinutos: 3,
    imagen: null,
    autor: demoUser,
    totalAmenes: 12,
    totalMeAyuda: 7,
    totalLaRezareHoy: 5,
    totalFavoritos: 4,
    totalComentarios: 2,
    esFavorito: false,
    miReaccion: null,
    creadoEn: now,
  },
  {
    id: 2,
    titulo: "Salmo de la manana",
    texto:
      "Al amanecer, Senor, escuchas mi voz; al amanecer te presento mi oracion y quedo a la espera. Que tu misericordia me rodee, pues en ti confio.",
    categoria: "Salmo",
    duracionMinutos: 5,
    imagen: null,
    autor: demoUser,
    totalAmenes: 9,
    totalMeAyuda: 3,
    totalLaRezareHoy: 8,
    totalFavoritos: 5,
    totalComentarios: 0,
    esFavorito: false,
    miReaccion: null,
    creadoEn: now,
  },
  {
    id: 3,
    titulo: "Intercesion por los enfermos",
    texto:
      "Padre misericordioso, elevo ante ti a todos los que sufren enfermedades del cuerpo y del alma. Que tu mano sanadora los toque y que tu consuelo llene sus corazones.",
    categoria: "Intercesion",
    duracionMinutos: 4,
    imagen: null,
    autor: demoUser,
    totalAmenes: 6,
    totalMeAyuda: 10,
    totalLaRezareHoy: 3,
    totalFavoritos: 2,
    totalComentarios: 0,
    esFavorito: false,
    miReaccion: null,
    creadoEn: now,
  },
];

const comentarios = new Map<number, DemoComentario[]>([
  [
    1,
    [
      {
        id: 1,
        texto: "Esta oracion me acompano en una noche dificil.",
        autor: demoUser,
        creadoEn: now,
      },
      {
        id: 2,
        texto: "Que Dios bendiga a quien la lea hoy.",
        autor: demoUser,
        creadoEn: now,
      },
    ],
  ],
]);

function findOracion(id: number) {
  return oraciones.find((oracion) => oracion.id === id);
}

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", mode: "demo" });
});

router.get("/auth/me", (_req, res) => {
  if (!currentDemoUser) {
    res.status(401).json({ mensaje: "No autenticado" });
    return;
  }

  const { password: _password, ...safeUser } = currentDemoUser;
  res.json(safeUser);
});

router.get("/auth/google", (_req, res) => {
  res.status(503).json({ mensaje: "Google OAuth requiere configurar base de datos y credenciales." });
});

router.post("/auth/logout", (_req, res) => {
  currentDemoUser = null;
  res.json({ mensaje: "Sesion cerrada" });
});

router.post("/auth/email/register", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const nombre = typeof req.body?.nombre === "string" && req.body.nombre.trim()
    ? req.body.nombre.trim()
    : email.split("@")[0] || "Usuario";

  if (!email || !email.includes("@") || password.length < 8) {
    res.status(400).json({ mensaje: "Introduce un email valido y una contrasena de al menos 8 caracteres." });
    return;
  }

  if (users.some((user) => user.email === email)) {
    res.status(409).json({ mensaje: "Ya existe una cuenta con este correo." });
    return;
  }

  const user: DemoUser = {
    id: nextUserId++,
    googleId: `email:${email}`,
    nombre,
    email,
    password,
    avatar: null,
    creadoEn: new Date().toISOString(),
  };
  users.push(user);
  currentDemoUser = user;
  res.status(201).json({ ...user, password: undefined });
});

router.post("/auth/email/login", (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = users.find((candidate) => candidate.email === email && candidate.password === password);

  if (!user) {
    res.status(401).json({ mensaje: "Correo o contrasena incorrectos." });
    return;
  }

  currentDemoUser = user;
  res.json({ ...user, password: undefined });
});

router.get("/oraciones", (req, res) => {
  const categoria = typeof req.query.categoria === "string" ? req.query.categoria : undefined;
  const busqueda = typeof req.query.busqueda === "string" ? req.query.busqueda.toLowerCase() : undefined;
  const filtered = oraciones.filter((oracion) => {
    const matchesCategoria = !categoria || oracion.categoria === categoria;
    const matchesBusqueda =
      !busqueda ||
      oracion.titulo.toLowerCase().includes(busqueda) ||
      oracion.texto.toLowerCase().includes(busqueda);
    return matchesCategoria && matchesBusqueda;
  });

  res.json({ oraciones: filtered, total: filtered.length, pagina: 1, totalPaginas: 1 });
});

router.post("/oraciones", (req, res) => {
  const { titulo, texto, categoria, duracionMinutos, imagen } = req.body;
  if (!titulo || !texto || !categoria) {
    res.status(400).json({ mensaje: "Titulo, texto y categoria son obligatorios." });
    return;
  }

  const oracion: DemoOracion = {
    id: nextOracionId++,
    titulo,
    texto,
    categoria,
    duracionMinutos: duracionMinutos ?? null,
    imagen: imagen ?? null,
    autor: demoUser,
    totalAmenes: 0,
    totalMeAyuda: 0,
    totalLaRezareHoy: 0,
    totalFavoritos: 0,
    totalComentarios: 0,
    esFavorito: false,
    miReaccion: null,
    creadoEn: new Date().toISOString(),
  };
  oraciones.unshift(oracion);
  res.status(201).json(oracion);
});

router.post("/admin/oraciones/import-csv", (req, res) => {
  try {
    const csv = typeof req.body?.csv === "string" ? req.body.csv : "";
    const allowDuplicates = Boolean(req.body?.allowDuplicates);

    if (!csv.trim()) {
      res.status(400).json({ mensaje: "Sube un CSV con titulo, texto y categoria." });
      return;
    }

    const imported = parseOracionesCsv(csv);
    let insertadas = 0;
    let omitidas = 0;

    for (const item of imported) {
      const duplicate = oraciones.some(
        (oracion) => oracion.titulo === item.titulo && oracion.categoria === item.categoria,
      );

      if (duplicate && !allowDuplicates) {
        omitidas += 1;
        continue;
      }

      oraciones.unshift({
        id: nextOracionId++,
        titulo: item.titulo,
        texto: item.texto,
        categoria: item.categoria,
        duracionMinutos: null,
        imagen: null,
        autor: demoUser,
        totalAmenes: 0,
        totalMeAyuda: 0,
        totalLaRezareHoy: 0,
        totalFavoritos: 0,
        totalComentarios: 0,
        esFavorito: false,
        miReaccion: null,
        creadoEn: new Date().toISOString(),
      });
      insertadas += 1;
    }

    res.status(201).json({
      total: imported.length,
      insertadas,
      omitidas,
      categorias: [...new Set(imported.map((oracion) => oracion.categoria))],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo importar el CSV.";
    res.status(400).json({ mensaje: message });
  }
});

router.get("/oraciones/destacadas", (_req, res) => {
  res.json([...oraciones].sort((a, b) => b.totalAmenes + b.totalMeAyuda - (a.totalAmenes + a.totalMeAyuda)));
});

router.get("/oraciones/recientes", (_req, res) => {
  res.json([...oraciones].sort((a, b) => Date.parse(b.creadoEn) - Date.parse(a.creadoEn)));
});

router.get("/oraciones/categorias", (_req, res) => {
  const counts = new Map<string, number>();
  for (const oracion of oraciones) {
    counts.set(oracion.categoria, (counts.get(oracion.categoria) ?? 0) + 1);
  }
  res.json([...counts.entries()].map(([categoria, conteo]) => ({ categoria, conteo })));
});

router.get("/oraciones/:id", (req, res) => {
  const oracion = findOracion(Number(req.params.id));
  if (!oracion) {
    res.status(404).json({ mensaje: "Oracion no encontrada" });
    return;
  }
  res.json({ ...oracion, comentarios: comentarios.get(oracion.id) ?? [] });
});

router.delete("/oraciones/:id", (req, res) => {
  const index = oraciones.findIndex((oracion) => oracion.id === Number(req.params.id));
  if (index === -1) {
    res.status(404).json({ mensaje: "Oracion no encontrada" });
    return;
  }
  oraciones.splice(index, 1);
  res.json({ mensaje: "Oracion eliminada" });
});

router.post("/oraciones/:id/favorito", (req, res) => {
  const oracion = findOracion(Number(req.params.id));
  if (!oracion) {
    res.status(404).json({ mensaje: "Oracion no encontrada" });
    return;
  }
  oracion.esFavorito = !oracion.esFavorito;
  oracion.totalFavoritos += oracion.esFavorito ? 1 : -1;
  res.json({ esFavorito: oracion.esFavorito, mensaje: oracion.esFavorito ? "Guardada" : "Quitada de favoritos" });
});

router.post("/oraciones/:id/reaccionar", (req, res) => {
  const oracion = findOracion(Number(req.params.id));
  const tipo = req.body?.tipo as string | undefined;
  if (!oracion || !tipo) {
    res.status(400).json({ mensaje: "Reaccion invalida" });
    return;
  }
  if (tipo === "amen") oracion.totalAmenes += 1;
  if (tipo === "me_ayuda") oracion.totalMeAyuda += 1;
  if (tipo === "la_rezare_hoy") oracion.totalLaRezareHoy += 1;
  oracion.miReaccion = tipo;
  res.json({
    tipo,
    mensaje: "Reaccion registrada",
    totalAmenes: oracion.totalAmenes,
    totalMeAyuda: oracion.totalMeAyuda,
    totalLaRezareHoy: oracion.totalLaRezareHoy,
  });
});

router.get("/oraciones/:id/comentarios", (req, res) => {
  res.json(comentarios.get(Number(req.params.id)) ?? []);
});

router.post("/oraciones/:id/comentarios", (req, res) => {
  const oracion = findOracion(Number(req.params.id));
  const texto = typeof req.body?.texto === "string" ? req.body.texto.trim() : "";
  if (!oracion || !texto) {
    res.status(400).json({ mensaje: "Comentario invalido" });
    return;
  }
  const comentario = { id: nextComentarioId++, texto, autor: demoUser, creadoEn: new Date().toISOString() };
  const list = comentarios.get(oracion.id) ?? [];
  list.unshift(comentario);
  comentarios.set(oracion.id, list);
  oracion.totalComentarios = list.length;
  res.status(201).json(comentario);
});

router.get("/favoritos", (_req, res) => {
  res.json(oraciones.filter((oracion) => oracion.esFavorito));
});

router.get("/mis-oraciones", (_req, res) => {
  res.json(oraciones);
});

router.get("/estadisticas", (_req, res) => {
  const totalComentarios = [...comentarios.values()].reduce((total, list) => total + list.length, 0);
  res.json({
    totalOraciones: oraciones.length,
    totalUsuarios: 1,
    totalComentarios,
    totalReacciones: oraciones.reduce(
      (total, oracion) => total + oracion.totalAmenes + oracion.totalMeAyuda + oracion.totalLaRezareHoy,
      0,
    ),
  });
});

export default router;
