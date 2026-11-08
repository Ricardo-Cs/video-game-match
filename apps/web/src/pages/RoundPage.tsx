import type { CellIndex, GameSearchResult } from '@vgm/contracts';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useRoundQuery, useSubmitGuessMutation } from '@/api/queries';
import { PagePanel } from '@/components/PagePanel';
import { AttemptsCounter } from '@/components/round/AttemptsCounter';
import { GameSearchDialog } from '@/components/round/GameSearchDialog';
import { RoundGrid } from '@/components/round/RoundGrid';
import { RoundSummary } from '@/components/round/RoundSummary';
import { useStartNewRound } from '@/hooks/useStartNewRound';
import {
  attemptsLeft,
  buildCellStates,
  categoriesOfCell,
  isRoundFinished,
  usedGameIdsOf,
} from '@/utils/roundCells';

const FEEDBACK_DURATION_MS = 3000;

interface GuessFeedback {
  isCorrect: boolean;
  message: string;
}

export function RoundPage() {
  const { roundId = '' } = useParams();
  const roundQuery = useRoundQuery(roundId);
  const guessMutation = useSubmitGuessMutation(roundId);
  const { startNewRound, isStarting, startError } = useStartNewRound();
  const [selectedCell, setSelectedCell] = useState<CellIndex | null>(null);
  const [feedback, setFeedback] = useState<GuessFeedback | null>(null);

  if (roundQuery.isPending) {
    return <CircularProgress aria-label="Carregando rodada" />;
  }

  if (roundQuery.isError) {
    return (
      <PagePanel title="Rodada indisponível" subtitle={roundQuery.error.message}>
        <Button variant="contained" onClick={startNewRound} loading={isStarting}>
          Começar outra rodada
        </Button>
      </PagePanel>
    );
  }

  const round = roundQuery.data;
  const cellStates = buildCellStates(round);
  const selectedCategories = selectedCell === null ? null : categoriesOfCell(round, selectedCell);

  const openSearch = (cell: CellIndex) => {
    guessMutation.reset();
    setSelectedCell(cell);
  };

  const closeSearch = () => {
    if (!guessMutation.isPending) setSelectedCell(null);
  };

  const submitGuess = (game: GameSearchResult) => {
    if (selectedCell === null || !selectedCategories) return;
    const [row, column] = selectedCategories;

    guessMutation.mutate(
      { cell: selectedCell, gameId: game.id },
      {
        onSuccess: ({ correct }) => {
          setSelectedCell(null);
          setFeedback({
            isCorrect: correct,
            message: correct
              ? `Acertou! ${game.name} vale para ${row.name} × ${column.name}.`
              : `${game.name} não atende a ${row.name} × ${column.name}.`,
          });
        },
      },
    );
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 560, alignItems: 'center' }}>
      <AttemptsCounter attemptsLeft={attemptsLeft(round)} maxAttempts={round.maxAttempts} />

      <RoundGrid round={round} cellStates={cellStates} onCellClick={openSearch} />

      {isRoundFinished(round) ? (
        <RoundSummary solvedCount={round.solvedCells.length} isStarting={isStarting} onPlayAgain={startNewRound} />
      ) : null}
      {startError ? <Alert severity="error">{startError.message}</Alert> : null}

      <GameSearchDialog
        isOpen={selectedCell !== null}
        title={selectedCategories ? `${selectedCategories[0].name} × ${selectedCategories[1].name}` : ''}
        usedGameIds={usedGameIdsOf(round)}
        isSubmitting={guessMutation.isPending}
        errorMessage={guessMutation.error?.message ?? null}
        onSelectGame={submitGuess}
        onClose={closeSearch}
      />

      <Snackbar
        open={feedback !== null}
        autoHideDuration={FEEDBACK_DURATION_MS}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback?.isCorrect ? 'success' : 'error'} variant="filled" sx={{ width: '100%' }}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
