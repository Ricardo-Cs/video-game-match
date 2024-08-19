import { Request, Response } from "express";
import { createCategoriesService, gameSearchService, verifyAnswerService } from "../services/gameService";

export const createCategoriesController = async (req: Request, res: Response) => {
    const categories = await createCategoriesService();
    res.json(categories)
}

export const searchGameController = async (req: Request, res: Response) => {
    try {
        const search = req.params.search;
        const response = await gameSearchService(search)
        res.json(response.data);
    } catch (error) {
        res.status(500).send(`Erro: ${error}`)
    }
}

export const verifyAnswerController = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const response = await verifyAnswerService(data);
        res.json(response.data)
    } catch (error) {
        res.status(500).send(`Erro: ${error}`)
    }
}