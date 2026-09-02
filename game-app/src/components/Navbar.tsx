import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Início', end: true },
  { to: '/singleplayer', label: 'Singleplayer', end: false },
];

export function Navbar() {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <VideogameAssetIcon />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          VideogameMatch
        </Typography>

        <Box component="nav" sx={{ display: 'flex', gap: 1 }}>
          {LINKS.map(({ to, label, end }) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              end={end}
              color="inherit"
              sx={{ '&.active': { textDecoration: 'underline' } }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
