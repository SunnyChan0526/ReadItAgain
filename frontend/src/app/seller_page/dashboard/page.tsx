import React from "react";
import Image from 'next/image'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material/styles'

function DashBoard() {
  return (
    <main>
        <img
          loading="lazy"
          src="/order.svg"
          alt="Order"
          className="pt-16 md:pt-20 self-start size-1/100"
        />
        <div>
          Order
        </div>
        <div>
          Book
        </div>
        <div>
          Coupon
        </div>
    </main>
  );
}
export default DashBoard;