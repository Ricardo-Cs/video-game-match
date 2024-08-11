import { Router } from "express";

const router = Router();

router.all('*', (req, res) => {
    return res.status(404).json('Rota inexistente!');
});

export default router;