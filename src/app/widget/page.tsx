"use client";
import React from 'react';
import { Fns, BackgroundBeamsDemo } from './screens';
import Link from 'next/link';

const WidgetPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left: Zen-Stealth header and Fns stepper */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start px-0 md:px-12 py-0 md:py-16 relative z-10 bg-white">
        <div className="w-full flex justify-center md:justify-start pt-8 md:pt-0">
          <Link href="/" className="focus:outline-none">
            <div className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer text-2xl font-black text-black mt-8 md:mt-0">
              <a href="/">Zen-Stealth</a>
            </div>
          </Link>
        </div>
        <div className="flex-1 w-full flex flex-col items-center">
          <Fns />
        </div>
      </div>
      {/* Right: Full black background, beam effect centered */}
      <div className="w-full md:w-1/2 min-h-screen bg-black flex items-center justify-center p-0 m-0">
        <div className="w-full h-full flex items-center justify-center">
          <BackgroundBeamsDemo />
        </div>
      </div>
    </div>
  );
};

export default WidgetPage;