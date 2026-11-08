import { Request, Response } from "express";
import { getRound, startRound, submitGuess } from "../services/roundService";

type RoundParams = { id: string };

export const startRoundController = async (_req: Request, res: Response) => {
    res.status(201).json(await startRound());
};

export const getRoundController = async (req: Request<RoundParams>, res: Response) => {
    res.json(await getRound(req.params.id));
};

export const submitGuessController = async (req: Request<RoundParams>, res: Response) => {
    res.status(201).json(await submitGuess(req.params.id, req.body));
};
