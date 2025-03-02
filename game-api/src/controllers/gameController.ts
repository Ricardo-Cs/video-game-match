import { Request, Response } from "express";
import { createCategoriesService, gameSearchService } from "../services/gameService";

export const createCategoriesController = async (req: Request, res: Response) => {
    const categories = createCategoriesService();
    res.json(categories)
}

export const searchGameController = async (req: Request, res: Response) => {
    try {
        const search = req.params.search;
        const response = await gameSearchService(search);
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: `Erro ao procurar o jogo: ${error}` })
    }
}

// export const verifyAnswerController = async (req: Request, res: Response) => {
//     try {
//         const data = req.body;
//         const response = await verifyAnswerService(data);
//         res.json(response)
//     } catch (error) {
//         res.status(500).json({ message: `Erro ao verificar a resposta: ${error}` })
//     }
// }