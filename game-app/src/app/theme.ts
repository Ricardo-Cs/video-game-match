import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#f0f0f0', paper: '#ffffff' },
    primary: { main: '#4c51bf' },
  },
  typography: {
    fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 10 },
});
