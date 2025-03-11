import { Router } from "express";
import { createCategoriesController, searchGameController, verifyAnswerController } from "../controllers/gameController";

const router = Router();

router.get('/game/search/:search', searchGameController);
router.get('/game/createCategories', createCategoriesController);
router.post('/game/verifyAnswer', verifyAnswerController)

router.all('*', (req, res) => {
    return res.status(404).json('Rota inexistente!');
});

export default router;