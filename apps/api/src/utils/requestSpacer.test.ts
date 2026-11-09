import { describe, expect, it, vi } from "vitest";

import { createRequestSpacer } from "./requestSpacer";

const setup = (startAt: number) => {
    let currentTime = startAt;
    const wait = vi.fn(async (_ms: number) => {});
    const waitForSlot = createRequestSpacer(250, () => currentTime, wait);

    return { waitForSlot, wait, advanceTo: (time: number) => { currentTime = time; } };
};

describe("createRequestSpacer", () => {
    it("deixa a primeira chamada sair na hora", async () => {
        const { waitForSlot, wait } = setup(1_000);

        await waitForSlot();

        expect(wait).not.toHaveBeenCalled();
    });

    it("espaça chamadas simultâneas pelo intervalo", async () => {
        const { waitForSlot, wait } = setup(1_000);

        await Promise.all([waitForSlot(), waitForSlot(), waitForSlot()]);

        expect(wait.mock.calls.map(([ms]) => ms)).toEqual([250, 500]);
    });

    it("só espera o que falta do intervalo desde a chamada anterior", async () => {
        const { waitForSlot, wait, advanceTo } = setup(1_000);

        await waitForSlot();
        advanceTo(1_100);
        await waitForSlot();

        expect(wait).toHaveBeenCalledWith(150);
    });

    it("não espera quando o intervalo já passou", async () => {
        const { waitForSlot, wait, advanceTo } = setup(1_000);

        await waitForSlot();
        advanceTo(2_000);
        await waitForSlot();

        expect(wait).not.toHaveBeenCalled();
    });
});
