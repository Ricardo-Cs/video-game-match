import { Router } from "express";
import { createGuessSchema, roundParamsSchema, searchParamsSchema } from "@vgm/contracts";
import { searchGameController } from "../controllers/gameController";
import { getRoundController, startRoundController, submitGuessController } from "../controllers/roundController";
import { roundCreationLimiter } from "../middlewares/rateLimiters";
import { validateBody, validateParams } from "../middlewares/validateRequest";

const router = Router();

router.get("/game/search/:search", validateParams(searchParamsSchema), searchGameController);

router.post("/rounds", roundCreationLimiter, startRoundController);
router.get("/rounds/:id", validateParams(roundParamsSchema), getRoundController);
router.post("/rounds/:id/guesses", validateParams(roundParamsSchema), validateBody(createGuessSchema), submitGuessController);

router.use((_req, res) => {
    res.status(404).json({ message: "Rota inexistente." });
});

export default router;
