import Grid from '@mui/material/Grid';
import { Stack } from '@mui/material';
import { ReactElement } from 'react';
import TopSellingProduct from '../../components/sections/dashboard/PanelProfesores/Sales/TopSellingProduct/TopSellingProduct';
import WebsiteVisitors from '../../components/sections/dashboard/PanelProfesores/Sales/WebsiteVisitors/WebsiteVisitors';
import SaleInfoCards from '../../components/sections/dashboard/PanelProfesores/Sales/SaleInfoSection/SaleInfoCards';
import BuyersProfile from '../../components/sections/dashboard/PanelProfesores/Sales/BuyersProfile/BuyersProfile';
import NewCustomers from '../../components/sections/dashboard/PanelProfesores/Sales/NewCustomers/NewCustomers';
import Revenue from '../../components/sections/dashboard/PanelProfesores/Sales/Revenue/Revenue';

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
      <Grid xs={12} lg={8}>
        <TopSellingProduct />
      </Grid>
      <Grid xs={12} lg={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column' }}
          gap={3.75}
          height={1}
          width={1}
        >
          <NewCustomers />
          <BuyersProfile />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Sales;
