import type { CategoryView, CellIndex, RoundView } from '@vgm/contracts';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';

import { GridCell } from '@/components/round/GridCell';
import { canGuessCell, cellIndexAt, type CellState } from '@/utils/roundCells';

interface RoundGridProps {
  round: RoundView;
  cellStates: CellState[];
  onCellClick: (cell: CellIndex) => void;
}

function CategoryHeader({ category }: { category: CategoryView }) {
  return (
    <Typography
      component="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: 500,
        fontSize: { xs: '0.7rem', sm: '0.875rem' },
        lineHeight: 1.2,
        p: 0.5,
        wordBreak: 'break-word',
      }}
    >
      {category.name}
    </Typography>
  );
}

export function RoundGrid({ round, cellStates, onCellClick }: RoundGridProps) {
  return (
    <Box
      role="grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '72px repeat(3, 1fr)', sm: '112px repeat(3, 1fr)' },
        gap: { xs: 0.75, sm: 1 },
        width: '100%',
      }}
    >
      <Box />
      {round.columns.map((column) => (
        <CategoryHeader key={column.name} category={column} />
      ))}

      {round.rows.map((row, rowIndex) => (
        <Fragment key={row.name}>
          <CategoryHeader category={row} />
          {round.columns.map((column, columnIndex) => {
            const cell = cellIndexAt(rowIndex, columnIndex);
            const state = cellStates[cell];

            return (
              <GridCell
                key={cell}
                state={state}
                label={`${row.name} × ${column.name}`}
                isDisabled={!canGuessCell(round, state)}
                onClick={() => onCellClick(cell)}
              />
            );
          })}
        </Fragment>
      ))}
    </Box>
  );
}
