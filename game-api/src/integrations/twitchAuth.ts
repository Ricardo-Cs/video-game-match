import axios from "axios";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

// A IGDB autentica com app access token da Twitch (client credentials),
// que expira em ~60 dias. Gerar e renovar aqui evita token fixo no .env.
// https://api-docs.igdb.com/#authentication

interface TwitchTokenResponse {
    access_token: string,
    expires_in: number,
    token_type: string
}

// Renova com folga para uma requisição em andamento não usar um token vencendo
const EXPIRY_MARGIN_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

let cachedToken: { value: string, expiresAt: number } | null = null;
let pendingRequest: Promise<string> | null = null;

const requestToken = async (): Promise<string> => {
    try {
        const { data } = await axios.post<TwitchTokenResponse>(
            env.TWITCH_AUTH_URL,
            new URLSearchParams({
                client_id: env.CLIENT_ID,
                client_secret: env.CLIENT_SECRET,
                grant_type: "client_credentials",
            }),
            { timeout: REQUEST_TIMEOUT_MS },
        );

        cachedToken = {
            value: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_MARGIN_MS,
        };
        return data.access_token;
    } catch (error) {
        console.error(error);
        throw new AppError("Não foi possível autenticar na IGDB.", 502);
    }
};

export const getAccessToken = async (): Promise<string> => {
    if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

    // Requisições simultâneas compartilham a mesma renovação
    pendingRequest ??= requestToken().finally(() => { pendingRequest = null; });
    return pendingRequest;
};

export const invalidateAccessToken = () => {
    cachedToken = null;
};
