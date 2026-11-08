import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from '@/components/RootLayout';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { RoundPage } from '@/pages/RoundPage';
import { Singleplayer } from '@/pages/Singleplayer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'singleplayer', element: <Singleplayer /> },
      { path: 'singleplayer/:roundId', element: <RoundPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
