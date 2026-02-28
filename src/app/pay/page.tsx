'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, isAddress } from 'viem';

export default function PayPage() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const toParam = params.get('to');
    const amountParam = params.get('amount');
    if (toParam && isAddress(toParam)) setTo(toParam);
    if (amountParam && !isNaN(parseFloat(amountParam))) setAmount(amountParam);
  }, []);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected || !walletClient || !address) {
      setTxStatus('Connect your wallet first');
      return;
    }
    if (!to || !isAddress(to)) {
      setTxStatus('Invalid recipient address');
      return;
    }
    const amt = amount.trim();
    if (!amt || parseFloat(amt) <= 0) {
      setTxStatus('Enter a valid amount');
      return;
    }
    setIsSending(true);
    setTxStatus('Confirm in your wallet...');
    try {
      const hash = await walletClient.sendTransaction({
        account: address,
        to: to as `0x${string}`,
        value: parseEther(amt),
      });
      setTxHash(hash);
      setTxStatus(`Sent ${amt} POL. Hash: ${hash}`);
    } catch (err) {
      setTxStatus(`Failed: ${(err as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  const isValid = to && isAddress(to) && amount.trim() && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  return (
    <div className="min-h-screen bg-white font-sans tracking-tight">
      <div className="border-b-2 border-black bg-[#FCD119]/10 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg text-xl font-black text-black">
          POL-Stealth
        </Link>
        <ConnectButton />
      </div>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-black mb-2 text-center">Pay POL</h1>
        <p className="text-center text-gray-600 mb-8">Send POL to this payment request.</p>
        <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-2xl p-6">
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">To (stealth address)</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 border-2 border-black rounded-xl bg-white text-black font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Amount (POL)</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 border-2 border-black rounded-xl bg-white text-black font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={!isValid || isSending || !isConnected}
              className="w-full py-3 px-6 rounded-xl border-2 border-black font-bold bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {!isConnected ? 'Connect wallet to pay' : isSending ? (
                <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending…</>
              ) : (
                `Send ${amount || '0'} POL`
              )}
            </button>
          </form>
          {txStatus && (
            <div className="mt-4 p-3 rounded-lg border-2 bg-gray-50 border-gray-200">
              <p className="text-sm font-semibold text-gray-800">{txStatus}</p>
              {txHash && (
                <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">View on PolygonScan →</a>
              )}
            </div>
          )}
        </div>
        <p className="text-center mt-6">
          <Link href="/workflow" className="text-sm text-gray-600 hover:underline">← Back to Workflow</Link>
        </p>
      </div>
    </div>
  );
}


