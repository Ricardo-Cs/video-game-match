import { z } from 'zod';

const envSchema = z.object({
    GAME_API_BASE_URL: z.string().url(),
    TWITCH_AUTH_URL: z.string().url().default('https://id.twitch.tv/oauth2/token'),
    CLIENT_ID: z.string().min(1),
    CLIENT_SECRET: z.string().min(1),
    PORT: z.coerce.number().default(3333),
});

export const env = envSchema.parse(process.env);
