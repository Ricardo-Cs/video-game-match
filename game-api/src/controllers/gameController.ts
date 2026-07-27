import { Request, Response } from "express";
import { createCategoriesService, gameSearchService, verifyAnswerService } from "../services/gameService";

// Express 5 encaminha rejeições de handlers async ao errorHandler automaticamente,
// então os controllers ficam livres de try/catch.
export const createCategoriesController = (_req: Request, res: Response) => {
    res.json(createCategoriesService());
};

export const searchGameController = async (req: Request, res: Response) => {
    const games = await gameSearchService(req.params.search);
    res.json(games);
};

export const verifyAnswerController = async (req: Request, res: Response) => {
    const result = await verifyAnswerService(req.body);
    res.json(result);
};
