import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CELL_COUNT } from '@vgm/contracts';

interface RoundSummaryProps {
  solvedCount: number;
  isStarting: boolean;
  onPlayAgain: () => void;
}

function summaryTitle(solvedCount: number) {
  if (solvedCount === CELL_COUNT) return 'Grade completa!';
  if (solvedCount === 0) return 'Não foi dessa vez';
  return 'Fim de jogo';
}

export function RoundSummary({ solvedCount, isStarting, onPlayAgain }: RoundSummaryProps) {
  return (
    <Paper
      elevation={3}
      role="status"
      sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
    >
      <Typography variant="h5" component="h2">
        {summaryTitle(solvedCount)}
      </Typography>
      <Typography color="text.secondary">
        Você acertou {solvedCount} de {CELL_COUNT} células.
      </Typography>
      <Button variant="contained" onClick={onPlayAgain} loading={isStarting}>
        Jogar de novo
      </Button>
    </Paper>
  );
}
