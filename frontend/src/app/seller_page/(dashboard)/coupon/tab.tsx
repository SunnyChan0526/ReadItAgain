"use client";
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import CouponList from "./coupon_list";
import SearchBar from "./searchbar";

export default function ColorTabs() {
  const [value, setValue] = React.useState('all');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const title = "Coupon List";

  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={value}>
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs"
            centered
            // variant="scrollable"
            // scrollButtons="auto"
          >
            <Tab value="all" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="All" />
            <Tab value="ongoing" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Ongoing" />
            <Tab value="upcoming" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Upcoming" />
            <Tab value="expired" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Expired" />
          </Tabs>
        </Box>
        <SearchBar />
        <TabPanel value="all"> <CouponList inputType = {'All'}/> </TabPanel>
        <TabPanel value="ongoing"> <CouponList inputType = {'Ongoing'}/> </TabPanel>
        <TabPanel value="upcoming"> <CouponList inputType = {'Upcoming'}/> </TabPanel>
        <TabPanel value="expired"> <CouponList inputType = {'Expired'}/> </TabPanel>
      </TabContext>
    </Box>
  );
}