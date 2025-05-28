import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { theme } from './presentation/theme/theme.ts';
import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from './shared/providers/BreakpointsProvider.tsx';
import router from './presentation/routes/router.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BreakpointsProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </BreakpointsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
