import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { theme } from './presentation/theme/theme.ts';
import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from './shared/providers/BreakpointsProvider.tsx';
import router from './presentation/routes/router.tsx';
import { AuthProvider } from './context/authContext.tsx'; // <-- Importa el AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <BreakpointsProvider>
          <CssBaseline />
          <RouterProvider router={router} />
        </BreakpointsProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);