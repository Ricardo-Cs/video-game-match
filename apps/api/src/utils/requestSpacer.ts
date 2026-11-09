export type Sleep = (ms: number) => Promise<void>;

export const sleep: Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reserva para cada chamada um horário de saída pelo menos `intervalMs` depois da anterior.
// A reserva é síncrona, então chamadas simultâneas também saem espaçadas.
export const createRequestSpacer = (intervalMs: number, now: () => number = Date.now, wait: Sleep = sleep) => {
    let nextSlotAt = 0;

    return async (): Promise<void> => {
        const currentTime = now();
        const slotAt = Math.max(currentTime, nextSlotAt);
        nextSlotAt = slotAt + intervalMs;

        if (slotAt > currentTime) await wait(slotAt - currentTime);
    };
};
