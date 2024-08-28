import { z } from 'zod';

const envSchema = z.object({
    GAME_API_BASE_URL: z.string().url(),
    CLIENT_ID: z.string(),
    PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
