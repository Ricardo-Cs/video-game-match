import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, type Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { CellState } from '@/utils/roundCells';

interface GridCellProps {
  state: CellState;
  label: string;
  isDisabled: boolean;
  onClick: () => void;
}

const STATUS_STYLES = {
  empty: { bgcolor: 'background.paper', borderColor: 'divider' },
  missed: { bgcolor: (theme: Theme) => alpha(theme.palette.error.main, 0.08), borderColor: 'error.main' },
  solved: { bgcolor: (theme: Theme) => alpha(theme.palette.success.main, 0.08), borderColor: 'success.main' },
} satisfies Record<CellState['status'], object>;

function SolvedCellContent({ game }: { game: Extract<CellState, { status: 'solved' }>['game'] }) {
  return (
    <>
      {game.coverUrl ? (
        <Box
          component="img"
          src={game.coverUrl}
          alt=""
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          px: 0.5,
          py: 0.25,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'common.white',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {game.name}
      </Typography>
    </>
  );
}

export function GridCell({ state, label, isDisabled, onClick }: GridCellProps) {
  const accessibleLabel = state.status === 'solved' ? `${label}: ${state.game.name}` : label;

  return (
    <ButtonBase
      onClick={onClick}
      disabled={isDisabled}
      aria-label={accessibleLabel}
      sx={{
        position: 'relative',
        aspectRatio: '1',
        width: '100%',
        overflow: 'hidden',
        border: 2,
        borderRadius: 1,
        ...STATUS_STYLES[state.status],
        '&:hover': { borderColor: 'primary.main' },
        '&.Mui-focusVisible': { outline: 3, outlineColor: 'primary.light' },
      }}
    >
      {state.status === 'solved' ? <SolvedCellContent game={state.game} /> : null}
      {state.status === 'missed' ? <CloseIcon color="error" fontSize="large" /> : null}
      {state.status === 'empty' && !isDisabled ? <AddIcon color="action" /> : null}
    </ButtonBase>
  );
}
