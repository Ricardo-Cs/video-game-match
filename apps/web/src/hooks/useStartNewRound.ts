import { useNavigate } from 'react-router-dom';

import { useStartRoundMutation } from '@/api/queries';

export function roundPath(roundId: string) {
  return `/singleplayer/${roundId}`;
}

export function useStartNewRound() {
  const navigate = useNavigate();
  const mutation = useStartRoundMutation();

  const startNewRound = () =>
    mutation.mutate(undefined, { onSuccess: (round) => navigate(roundPath(round.id)) });

  return { startNewRound, isStarting: mutation.isPending, startError: mutation.error };
}
