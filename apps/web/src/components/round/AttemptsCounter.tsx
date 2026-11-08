import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

const LOW_ATTEMPTS_THRESHOLD = 2;

interface AttemptsCounterProps {
  attemptsLeft: number;
  maxAttempts: number;
}

export function AttemptsCounter({ attemptsLeft, maxAttempts }: AttemptsCounterProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Tentativas restantes: <strong>{attemptsLeft}</strong> de {maxAttempts}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(attemptsLeft / maxAttempts) * 100}
        color={attemptsLeft <= LOW_ATTEMPTS_THRESHOLD ? 'warning' : 'primary'}
        aria-hidden
      />
    </Box>
  );
}
