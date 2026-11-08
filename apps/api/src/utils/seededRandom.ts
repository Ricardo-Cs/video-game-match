// A mesma seed sempre produz a mesma sequência, o que permite reproduzir uma grade
// (puzzle diário, depuração). Não é criptograficamente seguro: serve só para sorteio.

export type RandomNumberGenerator = () => number;

const UINT32_RANGE = 2 ** 32;

// FNV-1a de 32 bits: transforma a seed textual no estado inicial numérico
const hashSeed = (seed: string): number => {
    let hash = 0x811c9dc5;
    for (const character of seed) {
        hash ^= character.codePointAt(0)!;
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
};

// Mulberry32: gerador pequeno, rápido e com boa distribuição para jogos
export const createSeededRandom = (seed: string): RandomNumberGenerator => {
    let state = hashSeed(seed);

    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let mixed = Math.imul(state ^ (state >>> 15), state | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
    };
};

// Fisher-Yates: toda permutação tem a mesma chance de sair
export const shuffle = <T>(items: readonly T[], random: RandomNumberGenerator): T[] => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
};
