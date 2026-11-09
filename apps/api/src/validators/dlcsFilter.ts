// Para o jogador, expansão também é DLC; a IGDB guarda as duas em campos separados
export const dlcsFilter = (): string => "(dlcs != null | expansions != null)";
