import { Request, Response } from "express";
import { gameSearchService } from "../services/gameService";

export const searchGameController = async (req: Request<{ search: string }>, res: Response) => {
    res.json(await gameSearchService(req.params.search));
};
