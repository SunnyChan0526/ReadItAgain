import React from "react";
import Image from 'next/image'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import PrimarySearchAppBar from "./appbar";

function ReadItAgain() {
  
  return (
    <main className="overflow-x-hidden min-h-screen bg-white flex flex-col">
      <PrimarySearchAppBar></PrimarySearchAppBar>
      <Image
          src="/banner.svg"
          height={544}
          width={552}
          alt="Banner"
          className="pt-16 md:pt-20 self-center"
          priority
        />
        <div className="text-amber-900 text-center text-3xl md:text-5xl font-logofont self-center max-w-xs md:max-w-2xl mx-auto mb-10 md:mb-36">
          Welcome to Read it again!
        </div>
        
    </main>
  );
}


export default ReadItAgain;