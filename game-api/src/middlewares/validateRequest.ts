import { RequestHandler } from "express";
import { ZodType } from "zod";

// Valida (e normaliza) o corpo da requisição. Erros do Zod são
// encaminhados pelo Express ao errorHandler, que responde 400.
export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
};

export const validateParams = (schema: ZodType): RequestHandler => (req, _res, next) => {
    schema.parse(req.params);
    next();
};
