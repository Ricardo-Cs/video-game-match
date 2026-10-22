import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({ message: "Requisição inválida", issues: err.issues });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: "Erro interno do servidor" });
};
