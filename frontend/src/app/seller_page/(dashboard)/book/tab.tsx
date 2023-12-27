"use client";
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import TabPanel from '@mui/lab/TabPanel';
import BookList from "./book_list";

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
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value="all" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="All" />
            <Tab value="onsale" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="On sale" />
            <Tab value="sold" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Sold" />
            <Tab value="ordered" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="Ordered" />
            <Tab value="nopicture" sx={{ textTransform: 'none', fontSize: 'inherit' }} label="No picture" />
          </Tabs>
        </Box>
        <TabPanel value="all"> <BookList inputStatus = {'All'}/> </TabPanel>
        <TabPanel value="onsale"> <BookList inputStatus = {'On Sale'}/> </TabPanel>
        <TabPanel value="sold"> <BookList inputStatus = {'Sold'}/> </TabPanel>
        <TabPanel value="ordered"> <BookList inputStatus = {'Ordered'}/> </TabPanel>
        <TabPanel value="nopicture"> <BookList inputStatus = {'No Picture'}/> </TabPanel>
      </TabContext>
    </Box>
  );
}