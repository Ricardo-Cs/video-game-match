import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/Navbar';

export function RootLayout() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
