import React from 'react';
import { Box } from '@mui/material';
import VistaPrematricula from '../../components/sections/autenticacion/prematricula/vistaPrematricula';


const PreMatriculaPage: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 56, sm: 64 }, // ajusta si tienes appbar
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        py: 2,
        px: { xs: 1, sm: 2, md: 4 }
      }}
    >
      <VistaPrematricula />
    </Box>
  );
};

export default PreMatriculaPage;
