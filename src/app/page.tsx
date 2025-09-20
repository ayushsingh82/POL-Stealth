'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

const faqs = [
  {
    q: 'What is Zen-Stealth?',
    a: 'Zen-Stealth is a privacy protocol for private transactions on Horizen using stealth addresses and zero-knowledge cryptography.'
  },
  {
    q: 'How do stealth addresses work?',
    a: 'Stealth addresses allow you to receive funds privately. Only the receiver can detect and claim the funds.'
  },
  {
    q: 'Is my wallet compatible?',
    a: 'Any EVM-compatible wallet can be used with Zen-Stealth.'
  },
  {
    q: 'Is Zen-Stealth open source?',
    a: 'Yes! The code is open source and available on GitHub.'
  },
];

export default function Home() {
  // Only 2 circles on each side, with gray border
  const yellowCircles = [
    // Left corners
    { className: 'fixed left-[-40px] top-[-40px] w-40 h-40', color: 'bg-[#FCD119]/70', blur: 'blur-sm', delay: 0 },
    { className: 'fixed left-[-32px] bottom-[-32px] w-32 h-32', color: 'bg-[#FCF569]/70', blur: 'blur', delay: 0.2 },
    // Right corners
    { className: 'fixed right-[-40px] top-[-40px] w-40 h-40', color: 'bg-[#FCD119]/70', blur: 'blur-sm', delay: 0.4 },
    { className: 'fixed right-[-32px] bottom-[-32px] w-32 h-32', color: 'bg-[#FEDE27]/70', blur: 'blur', delay: 0.6 },
  ];

  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans tracking-tight relative overflow-x-hidden">
      {/* Animated yellow background circles with gray border */}
      {yellowCircles.map((circle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 10, repeat: Infinity, delay: circle.delay, ease: 'easeInOut' }}
          className={`${circle.className} ${circle.color} ${circle.blur} rounded-full border-2 border-gray-300 pointer-events-none z-0`}
        />
      ))}

      {/* HEADER */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="focus:outline-none">
          <div className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer">
            <h1 className="text-2xl font-black text-black">Zen-Stealth</h1>
          </div>
        </Link>
      </div>

     

      {/* HERO */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-6xl h-128 bg-gradient-to-r from-[#FAF7C0] via-[#FCF569] to-[#FEDE27] rounded-b-[50%] shadow-2xl flex items-end justify-center pb-8">
            <div className="text-center">
              <p className="text-md font-black mb-16 text-white bg-black px-3 py-2 rounded-lg inline-block">Experience the Future of</p>
              <h3 className="text-6xl font-bold font-black text-black italic mb-1">
                PRIVATE Transaction
              </h3>
              <h2 className="text-6xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block italic">on Horizen</h2>
            </div>
          </div>
        </div>
      </div>


      <div className="text-center mt-32 mb-6 flex flex-col md:flex-row items-center justify-center gap-6">
      <Link href="/widget">
          <button className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-black hover:bg-[#FCD119]/90 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Join the Waitlist</button>
        </Link>
        
          <Link href="/launch">
            <button className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-8 py-4 rounded-lg text-lg font-bold text-black hover:bg-[#FCD119]/90 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]">Launch App</button>
          </Link>
        </div>

      {/* MAIN CONTENT - BENTO GRID */}
      <div className="max-w-5xl mx-auto px-4 pb-20 mt-32">
        <div className="grid grid-cols-12 gap-6 auto-rows-[180px]">
          {/* Why Privacy Matters */}
          <div className="col-span-12 md:col-span-6 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">Why Privacy Matters</h2>
            <p className="text-sm text-black leading-relaxed">In the digital era, your financial privacy is non-negotiable. Our platform uses battle-tested, advanced cryptography so your transactions stay truly private—secure, anonymous, and transparent only to you.</p>
          </div>
          {/* Our Zero-Knowledge Edge */}
          <div className="col-span-12 md:col-span-6 row-span-2 bg-[#FCD119] border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-black mb-4 text-white bg-black px-3 py-2 rounded-lg inline-block">Our Zero-Knowledge Edge</h2>
            <p className="text-sm text-black mb-4 leading-relaxed">Harness Horizen's advanced zero-knowledge proof technology for:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Absolute transaction privacy</span></li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Cutting-edge cryptographic security</span></li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Lightning-fast settlements</span></li>
              <li className="flex items-center"><span className="w-2 h-2 rounded-full mr-3 bg-black"></span><span className="text-black font-semibold">Decentralized, robust infrastructure</span></li>
            </ul>
          </div>
          {/* How It Works */}
          <div className="col-span-12 md:col-span-8 row-span-2 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">How It Works</h2>
            <p className="text-sm text-black mb-4 leading-relaxed">Your path to unbreakable privacy is just three simple steps away:</p>
            <div className="space-y-3">
              <div className="flex items-start"><span className="text-lg font-extrabold text-black mr-3">1</span><div><div className="font-bold text-black mb-1 text-sm">Connect Wallet</div><div className="text-xs text-black">Securely link your digital wallet in seconds—private keys never leave your device.</div></div></div>
              <div className="flex items-start"><span className="text-lg font-extrabold text-black mr-3">2</span><div><div className="font-bold text-black mb-1 text-sm">Enter Transaction</div><div className="text-xs text-black">Enter your recipient's address and the amount to send—no trails, no identifiers.</div></div></div>
              <div className="flex items-start"><span className="text-lg font-extrabold text-black mr-3">3</span><div><div className="font-bold text-black mb-1 text-sm">Send Privately</div><div className="text-xs text-black">Your transaction is processed instantly, with full anonymity—powered by zero-knowledge proofs.</div></div></div>
            </div>
          </div>
          {/* The Future of Private Transactions */}
          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col justify-center">
            <h3 className="text-lg font-black mb-2 text-[#FCD119] bg-black px-3 py-1 rounded-lg inline-block">The Future of Private Transactions</h3>
            <p className="text-black text-sm mt-2">We’re building the next generation of blockchain privacy. Horizen’s zero-knowledge proofs and advanced cryptography deliver truly anonymous transactions.</p>
          </div>
          {/* Advanced Privacy */}
          <div className="col-span-12 md:col-span-4 row-span-1 bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col justify-center">
            <h4 className="text-lg font-bold text-[#FCD119] mb-2 bg-black px-3 py-1 rounded-lg inline-block">Advanced Privacy</h4>
            <p className="text-black text-sm mt-2">Zero-knowledge proofs keep your transactions completely private while maintaining security and transparency.</p>
          </div>
        </div>

        {/* FAQ SECTION - moved up */}
        <section className="relative z-10 px-4 py-16 border-t border-[#FCD119]/20 mt-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-black mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-[#FCD119] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-[#FCD119] transition-all duration-300 focus:outline-none"
                  >
                    <span className="font-medium text-black text-lg">{faq.q}</span>
                    <span className="text-2xl text-black">{expandedFaq === index ? '−' : '+'}</span>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 text-black/80 animate-fade-in">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

    
       
      </div>
    </div>
  );
}
