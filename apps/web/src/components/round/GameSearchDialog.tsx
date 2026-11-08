import type { GameSearchResult } from '@vgm/contracts';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

import { MIN_SEARCH_LENGTH, useGameSearchQuery } from '@/api/queries';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const SEARCH_DEBOUNCE_MS = 300;

interface GameSearchDialogProps {
  isOpen: boolean;
  title: string;
  usedGameIds: Set<number>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSelectGame: (game: GameSearchResult) => void;
  onClose: () => void;
}

function gameLabel(game: GameSearchResult) {
  return game.release_year ? `${game.name} (${game.release_year})` : game.name;
}

function noOptionsText(term: string, hasSearchFailed: boolean) {
  if (hasSearchFailed) return 'Não foi possível buscar agora. Tente de novo.';
  if (term.trim().length < MIN_SEARCH_LENGTH) return `Digite ao menos ${MIN_SEARCH_LENGTH} letras.`;
  return 'Nenhum jogo encontrado.';
}

export function GameSearchDialog({
  isOpen,
  title,
  usedGameIds,
  isSubmitting,
  errorMessage,
  onSelectGame,
  onClose,
}: GameSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
  const searchQuery = useGameSearchQuery(debouncedTerm);
  const isWaitingForResults = searchTerm !== debouncedTerm || searchQuery.isFetching;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ transition: { onExited: () => setSearchTerm('') } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <Autocomplete
          options={searchQuery.data ?? []}
          getOptionLabel={gameLabel}
          getOptionDisabled={(game) => usedGameIds.has(game.id)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          filterOptions={(options) => options}
          inputValue={searchTerm}
          onInputChange={(_event, value) => setSearchTerm(value)}
          onChange={(_event, game) => {
            if (game) onSelectGame(game);
          }}
          value={null}
          loading={isWaitingForResults && searchTerm.trim().length >= MIN_SEARCH_LENGTH}
          loadingText="Buscando…"
          noOptionsText={noOptionsText(searchTerm, searchQuery.isError)}
          disabled={isSubmitting}
          blurOnSelect
          autoHighlight
          openOnFocus
          renderInput={(params) => (
            <TextField {...params} autoFocus label="Nome do jogo" placeholder="Ex.: Hollow Knight" />
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
