import rateLimit from "express-rate-limit";

// Sortear uma rodada pode custar dezenas de consultas à IGDB (cota de ~4 req/s compartilhada
// por todos os jogadores) e grava uma linha nova no banco: o limite protege as duas coisas
const ROUND_CREATION_WINDOW_MS = 60 * 1000;
const MAX_ROUNDS_PER_WINDOW = 10;

export const roundCreationLimiter = rateLimit({
    windowMs: ROUND_CREATION_WINDOW_MS,
    limit: MAX_ROUNDS_PER_WINDOW,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas rodadas criadas em pouco tempo. Espere um minuto e tente de novo." },
});
