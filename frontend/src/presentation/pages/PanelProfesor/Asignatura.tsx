import Grid from '@mui/material/Grid';
import { Stack } from '@mui/material';
import { ReactElement } from 'react';


import { drawerWidth } from '../../layouts/panelprofesor-layout';

const Sales = (): ReactElement => {
  return (
    <Grid
      container
      component="main"
      columns={12}
      spacing={3.75}
      flexGrow={1}
      pt={4.375}
      pr={1.875}
      pb={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        pl: { xs: 3.75, lg: 0 },
      }}
    >
    </Grid>
  );
};

export default Sales;
