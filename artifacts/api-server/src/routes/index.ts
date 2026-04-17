import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import oracionesRouter from "./oraciones";
import favoritosRouter from "./favoritos";
import comentariosRouter from "./comentarios";
import reaccionesRouter from "./reacciones";
import estadisticasRouter from "./estadisticas";
import misOracionesRouter from "./misOraciones";
import adminImportRouter from "./adminImport";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(oracionesRouter);
router.use(favoritosRouter);
router.use(comentariosRouter);
router.use(reaccionesRouter);
router.use(estadisticasRouter);
router.use(misOracionesRouter);
router.use(adminImportRouter);

export default router;
