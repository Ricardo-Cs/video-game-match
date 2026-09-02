import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from '@/components/RootLayout';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { Singleplayer } from '@/pages/Singleplayer';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'singleplayer', element: <Singleplayer /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
