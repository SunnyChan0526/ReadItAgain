"use client";
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel';
import OrderList from "./order_list";

export default function ColorTabs() {
  const [value, setValue] = React.useState('all');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%'}}>
      <TabContext value={value}>
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs"
            centered
          >
            <Tab value="all" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="All" />
            <Tab value="unpaid" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Unpaid" />
            <Tab value="toship" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="To ship" />
            <Tab value="shipping" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Shipping" />
            <Tab value="completed" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Completed" />
            <Tab value="cancellation" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Cancellation" />
          </Tabs>
        </Box>
        <TabPanel value="all"> <OrderList inputStatus = {'All'}/> </TabPanel>
        <TabPanel value="unpaid"> <OrderList inputStatus = {'Unpaid'}/> </TabPanel>
        <TabPanel value="toship"> <OrderList inputStatus = {'To ship'}/> </TabPanel>
        <TabPanel value="shipping"> <OrderList inputStatus = {'Shipping'}/> </TabPanel>
        <TabPanel value="completed"> <OrderList inputStatus = {'Completed'}/> </TabPanel>
        <TabPanel value="cancellation"> <OrderList inputStatus = {'Cancellation'}/> </TabPanel>
      </TabContext>
    </Box>
  ); 
}