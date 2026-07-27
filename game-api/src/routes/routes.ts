import { Router } from "express";
import { createCategoriesController, searchGameController, verifyAnswerController } from "../controllers/gameController";
import { validateBody, validateParams } from "../middlewares/validateRequest";
import { searchParamsSchema, verifyAnswerSchema } from "../schemas/gameSchemas";

const router = Router();

router.get("/game/search/:search", validateParams(searchParamsSchema), searchGameController);
router.get("/game/createCategories", createCategoriesController);
router.post("/game/verifyAnswer", validateBody(verifyAnswerSchema), verifyAnswerController);

// Handler de "rota não encontrada" (sem path, compatível com Express 5)
router.use((_req, res) => {
    return res.status(404).json("Rota inexistente!");
});

export default router;
