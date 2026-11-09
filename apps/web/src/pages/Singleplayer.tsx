import { MAX_ATTEMPTS_PER_ROUND } from '@vgm/contracts';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { PagePanel } from '@/components/PagePanel';
import { useStartNewRound } from '@/hooks/useStartNewRound';

export function Singleplayer() {
  const { startNewRound, isStarting, startError } = useStartNewRound();

  return (
    <PagePanel
      title="Singleplayer"
      subtitle={`Encontre um jogo que atenda à linha e à coluna de cada célula. São ${MAX_ATTEMPTS_PER_ROUND} tentativas para completar a grade.`}
    >
      {startError ? <Alert severity="error">{startError.message}</Alert> : null}
      <Button variant="contained" size="large" onClick={startNewRound} loading={isStarting}>
        Nova rodada
      </Button>
    </PagePanel>
  );
}
