import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAccessToken, invalidateAccessToken } from "./twitchAuth";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

vi.mock("../config/env", () => ({
    env: {
        TWITCH_AUTH_URL: "https://id.twitch.test/oauth2/token",
        CLIENT_ID: "client-id",
        CLIENT_SECRET: "client-secret",
    },
}));

const mockedPost = vi.mocked(axios.post);

const tokenResponse = (accessToken: string, expiresIn = 3600) => ({
    data: { access_token: accessToken, expires_in: expiresIn, token_type: "bearer" },
});

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    invalidateAccessToken();
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.useRealTimers();
});

describe("getAccessToken", () => {
    it("gera o token via client credentials", async () => {
        mockedPost.mockResolvedValue(tokenResponse("token-1"));

        await expect(getAccessToken()).resolves.toBe("token-1");

        const [url, body] = mockedPost.mock.calls[0];
        expect(url).toBe("https://id.twitch.test/oauth2/token");
        expect(String(body)).toBe("client_id=client-id&client_secret=client-secret&grant_type=client_credentials");
    });

    it("reaproveita o token enquanto ele é válido", async () => {
        mockedPost.mockResolvedValue(tokenResponse("token-1"));

        await getAccessToken();
        await getAccessToken();

        expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it("renova antes de expirar, com margem de 1 minuto", async () => {
        mockedPost
            .mockResolvedValueOnce(tokenResponse("token-1", 3600))
            .mockResolvedValueOnce(tokenResponse("token-2", 3600));

        await getAccessToken();

        vi.advanceTimersByTime((3600 - 61) * 1000);
        await expect(getAccessToken()).resolves.toBe("token-1");

        vi.advanceTimersByTime(2 * 1000);
        await expect(getAccessToken()).resolves.toBe("token-2");
    });

    it("compartilha uma única renovação entre chamadas simultâneas", async () => {
        mockedPost.mockResolvedValue(tokenResponse("token-1"));

        const tokens = await Promise.all([getAccessToken(), getAccessToken(), getAccessToken()]);

        expect(tokens).toEqual(["token-1", "token-1", "token-1"]);
        expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it("gera um novo token depois de invalidado", async () => {
        mockedPost
            .mockResolvedValueOnce(tokenResponse("token-1"))
            .mockResolvedValueOnce(tokenResponse("token-2"));

        await getAccessToken();
        invalidateAccessToken();

        await expect(getAccessToken()).resolves.toBe("token-2");
    });

    it("converte falha da Twitch em AppError 502", async () => {
        mockedPost.mockRejectedValue(new Error("network down"));

        await expect(getAccessToken()).rejects.toMatchObject({ name: "AppError", statusCode: 502 });
    });
});
