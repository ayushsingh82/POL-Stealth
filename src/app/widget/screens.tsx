"use client";
import React, { useState } from "react";
import { motion } from 'framer-motion';
import { BackgroundBeams } from '../../components/ui/background-beams';
import imagesJson from './images.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
const images: Record<string, string> = imagesJson;

const CHAINS = [
  { label: 'Sei', value: 'sei' },
  { label: 'Horizen', value: 'horizen' },
];
const TOKENS = [
  { name: 'USDT', chain: 'sei', label: 'Tether (USDT)' },
  { name: 'USDC', chain: 'sei', label: 'USD Coin (USDC)' },

  { name: 'USDT', chain: 'horizen', label: 'Tether (USDT)' },
  { name: 'USDC', chain: 'horizen', label: 'USD Coin (USDC)' },
 
];

export function Fns() {
  const [step, setStep] = useState(1);
  const [walletType, setWalletType] = useState<'personal' | 'merchant' | null>(null);
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [payOrReceive, setPayOrReceive] = useState<'pay' | 'receive' | null>(null);

  // Button requirements
  const canNextStep1 = !!walletType;
  const canNextStep2 = !!selectedChain && !!selectedToken;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Heading and subtitle OUTSIDE the box */}
      {step === 1 && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold mb-2 mt-6 text-black tracking-tight">Create Account</h2>
          <p className="text-base text-gray-700">Set up your wallet to get started</p>
        </div>
      )}
      {step === 2 ? (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center mt-8">
          <div className="w-full max-w-md bg-white/90 border-2 border-black border-r-8 border-b-8 rounded-3xl p-10 backdrop-blur-sm">
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-black">Chain</label>
              <select
                className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] hover:border-[#FCD119] transition appearance-none shadow-md outline-none"
                value={selectedChain}
                onChange={e => {
                  setSelectedChain(e.target.value);
                  setSelectedToken('');
                }}
              >
                <option value="">Select chain</option>
                {CHAINS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-black">Token</label>
              <select
                className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] hover:border-[#FCD119] transition appearance-none shadow-md outline-none"
                value={selectedToken}
                onChange={e => setSelectedToken(e.target.value)}
                disabled={!selectedChain}
              >
                <option value="">Select token</option>
                {TOKENS.filter(t => t.chain === selectedChain).map(t => (
                  <option key={t.name} value={t.name}>{t.label}</option>
                ))}
              </select>
            </div>
            {selectedChain && selectedToken && (
              <>
                <div className="text-black font-bold text-lg mb-1 mt-4">Selected</div>
                <div className="p-4 border-2 border-[#FCD119] bg-[#FCD119]/10 flex flex-col items-center rounded-none shadow-sm">
                  <div className="flex gap-4 items-center">
                    <span className="flex items-center px-3 py-1 rounded-none bg-black text-white text-sm font-semibold border border-gray-300">
                      <img src={images[selectedChain]} alt={selectedChain + ' logo'} className="w-6 h-6 mr-2" />
                      {CHAINS.find(c => c.value === selectedChain)?.label}
                    </span>
                    <span className="flex items-center px-3 py-1 rounded-none bg-[#FCD119] text-black text-sm font-semibold border border-gray-300">
                      <img src={images[selectedToken.toLowerCase()]} alt={selectedToken + ' logo'} className="w-6 h-6 mr-2" />
                      {TOKENS.find(t => t.name === selectedToken && t.chain === selectedChain)?.label}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : step === 3 ? (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center mt-8">
          <div className="w-full max-w-md bg-white/90 border-2 border-black border-r-8 border-b-8 rounded-3xl p-10 backdrop-blur-sm">
            <div className="mb-4 w-full flex justify-center">
              <ConnectButton />
            </div>
            <div className="text-black font-bold text-lg mb-1 mt-2">Selected</div>
            <div className="p-4 border-2 border-[#FCD119] bg-[#FCD119]/10 flex flex-col items-center rounded-none shadow-sm mb-6">
              <div className="flex gap-4 items-center">
                <span className="flex items-center px-3 py-1 rounded-none bg-black text-white text-sm font-semibold border border-gray-300">
                  <img src={images[selectedChain]} alt={selectedChain + ' logo'} className="w-6 h-6 mr-2" />
                  {CHAINS.find(c => c.value === selectedChain)?.label}
                </span>
                <span className="flex items-center px-3 py-1 rounded-none bg-[#FCD119] text-black text-sm font-semibold border border-gray-300">
                  <img src={images[selectedToken.toLowerCase()]} alt={selectedToken + ' logo'} className="w-6 h-6 mr-2" />
                  {TOKENS.find(t => t.name === selectedToken && t.chain === selectedChain)?.label}
                </span>
              </div>
            </div>
            <div className="text-black font-bold text-lg mb-4">Do you want to Pay or Receive?</div>
            <div className="flex gap-8 justify-center mb-4">
              <button
                className={`px-8 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition ${payOrReceive === 'pay' ? 'ring-2 ring-[#FCD119]' : ''}`}
                onClick={() => setPayOrReceive('pay')}
              >
                Pay
              </button>
              <button
                className={`px-8 py-3 rounded-xl border-2 border-black font-bold text-lg bg-black text-white hover:bg-[#FCD119] hover:text-black transition ${payOrReceive === 'receive' ? 'ring-2 ring-[#FCD119]' : ''}`}
                onClick={() => setPayOrReceive('receive')}
              >
                Receive
              </button>
            </div>
            {payOrReceive === 'pay' && (
              <div className="flex flex-col gap-4 mt-4 w-full">
                <input
                  type="text"
                  placeholder="Recipient Address"
                  className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                />
              </div>
            )}
            {payOrReceive === 'receive' && (
              <div className="mt-4 w-full text-center text-black font-semibold text-lg">
                Share your stealth address with the recipient
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/90 border-2 border-black border-r-8 border-b-8 rounded-3xl p-10 mt-0 md:mt-4 backdrop-blur-sm">
          {step === 1 && (
            <>
              <div className="mb-2 text-lg font-semibold text-black">Wallet Type</div>
              <div className="flex flex-col gap-4 mb-8">
                <button
                  className={`py-3 px-6 border-4 border-black rounded-none font-semibold text-lg text-left transition shadow-md hover:shadow-xl focus:outline-none ${walletType === 'personal' ? 'bg-[#FCD119] text-black' : 'bg-white text-black hover:bg-[#FCD119]/20'}`}
                  onClick={() => setWalletType('personal')}
                >
                  <div className="font-bold text-xl mb-1">Personal</div>
                  <div className="text-gray-700 text-base">For personal use</div>
                </button>
                <button
                  className={`py-3 px-6 border-4 border-black rounded-none font-semibold text-lg text-left transition shadow-md hover:shadow-xl focus:outline-none ${walletType === 'merchant' ? 'bg-[#FCD119] text-black' : 'bg-white text-black hover:bg-[#FCD119]/20'}`}
                  onClick={() => setWalletType('merchant')}
                >
                  <div className="font-bold text-xl mb-1">Team</div>
                  <div className="text-gray-700 text-base">need pro access</div>
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {/* Navigation Buttons OUTSIDE the box, centered */}
      <div className="flex gap-6 mt-8 w-full max-w-md justify-center">
        <button
          className="px-8 py-3 rounded-xl border-2 border-black font-bold text-lg bg-white text-black hover:bg-[#FCD119] hover:text-black transition disabled:opacity-50 shadow-md"
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
        >
          Back
        </button>
        <button
          className="px-8 py-3 rounded-xl border-2 border-black font-bold text-lg bg-black text-white hover:bg-[#FCD119] hover:text-black transition disabled:opacity-50 shadow-md"
          disabled={step === 1 ? !canNextStep1 : step === 2 ? !canNextStep2 : false}
          onClick={() => {
            if (step === 1 && canNextStep1) setStep(2);
            else if (step === 2 && canNextStep2) setStep(3);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function BackgroundBeamsDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 to-yellow-600  text-center font-sans font-bold">
          Private. Anonymous. Unlinkable.
        </h1>
        <p></p>
        <p className="text-white max-w-lg mx-auto my-2 text-md text-center relative z-10">
          Welcome to the world of private transaction . Everything you need is privacy and we are here to help you with this
        </p>
      </div>
      <BackgroundBeams />
    </div>
  );
}

export { motion };


