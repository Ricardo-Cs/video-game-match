import type { ReactNode } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PagePanelProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PagePanel({ title, subtitle, children }: PagePanelProps) {
  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 640, width: '100%' }}>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography variant="h4" component="h1">
          {title}
        </Typography>

        {subtitle ? (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}

        {children}
      </Stack>
    </Paper>
  );
}
