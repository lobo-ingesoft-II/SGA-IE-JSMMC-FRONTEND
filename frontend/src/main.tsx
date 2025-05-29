import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { theme } from './presentation/theme/theme.ts';
import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from './shared/providers/BreakpointsProvider.tsx';
import router from './presentation/routes/router.tsx';
import { AuthProvider } from './context/AuthContext'; // <-- Importa el AuthProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BreakpointsProvider>
        <CssBaseline />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </BreakpointsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);