import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import { PagePanel } from '@/components/PagePanel';

export function Home() {
  return (
    <PagePanel title="Video Game Match" subtitle="Comece uma partida">
      <Button component={Link} to="/singleplayer" variant="contained" size="large">
        Singleplayer
      </Button>
    </PagePanel>
  );
}
