import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import { PagePanel } from '@/components/PagePanel';

export function NotFound() {
  return (
    <PagePanel title="Página não encontrada" subtitle="Esse endereço não existe.">
      <Button component={Link} to="/" variant="contained">
        Voltar ao início
      </Button>
    </PagePanel>
  );
}
