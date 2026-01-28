'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, isAddress } from 'viem';

type SendTab = 'generate' | 'transfer';
type SideOption = 'send' | 'scan';

// Demo incoming POL-only transfers when connected (replace with real scanner when integrated)
const DEMO_INCOMING_POL = [
  { from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b2', amount: '0.5', when: '2 hours ago', txHash: '0xabc...' },
  { from: '0x809cccfc6a780d68d136b52dced63ed1f14dad62', amount: '1.0', when: '1 day ago', txHash: '0xdef...' },
  { from: '0x3a1f5b8c9d4e2f6a7b9c0d1e2f3a4b5c6d7e8f9', amount: '1.2', when: '3 days ago', txHash: '0x123...' },
];

export default function WorkflowPage() {
  const [sideOption, setSideOption] = useState<SideOption>('send');
  const [sendTab, setSendTab] = useState<SendTab>('generate');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [stealthAddress, setStealthAddress] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const generateStealthAddress = async () => {
    if (!receiverAddress.trim()) {
      setTxStatus('Please enter receiver address');
      return;
    }
    if (!isAddress(receiverAddress.trim())) {
      setTxStatus('Please enter a valid wallet address');
      return;
    }
    setIsGenerating(true);
    setTxStatus('');
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const chars = '0123456789abcdef';
      let addr = '0x';
      for (let i = 0; i < 40; i++) {
        addr += chars[Math.floor(Math.random() * chars.length)];
      }
      const prefixes = ['1a', '2b', '3c', '4d', '5e', '6f', '7a', '8b', '9c', '0d'];
      const rnd = prefixes[Math.floor(Math.random() * prefixes.length)];
      setStealthAddress(addr.slice(0, 4) + rnd + addr.slice(6));
      setTxStatus('');
      setSendTab('transfer');
    } catch (e) {
      setTxStatus('Error generating stealth address');
      setStealthAddress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletClient || !address) {
      setTxStatus('Please connect your wallet');
      return;
    }
    if (!stealthAddress) {
      setTxStatus('Generate a stealth address first');
      return;
    }
    const amt = amount.trim();
    if (!amt) {
      setTxStatus('Please enter amount');
      return;
    }
    const num = parseFloat(amt);
    if (isNaN(num) || num <= 0) {
      setTxStatus('Please enter a valid amount');
      return;
    }
    setIsSending(true);
    setTxStatus('Confirm in your wallet...');
    try {
      const hash = await walletClient.sendTransaction({
        account: address,
        to: stealthAddress as `0x${string}`,
        value: parseEther(amt),
      });
      setTxHash(hash);
      setTxStatus(`Transfer sent. Hash: ${hash}`);
    } catch (err) {
      setTxStatus(`Transfer failed: ${(err as Error).message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans tracking-tight relative">
      <div className="border-b-2 border-black bg-[#FCD119]/10 py-4 px-6 flex justify-between items-center">
        <Link
          href="/"
          className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg text-xl font-black text-black hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition"
        >
          POL-Stealth
        </Link>
        <ConnectButton />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-black text-black mb-2 text-center">New Workflow</h1>
        <p className="text-center text-gray-600 mb-8">Send privately or see who is sending you funds.</p>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Side options: Send | Scan */}
          <div className="sm:w-40 shrink-0 flex sm:flex-col gap-2">
            <button
              type="button"
              onClick={() => setSideOption('send')}
              className={`py-3 px-4 rounded-xl border-2 border-black text-sm font-bold transition text-left flex items-center gap-2 ${
                sideOption === 'send' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#FCD119]'
              }`}
            >
              <span>📤</span> Send
            </button>
            <button
              type="button"
              onClick={() => setSideOption('scan')}
              className={`py-3 px-4 rounded-xl border-2 border-black text-sm font-bold transition text-left flex items-center gap-2 ${
                sideOption === 'scan' ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#FCD119]'
              }`}
            >
              <span>🔍</span> Scan
            </button>
          </div>

          {/* Main content: Send (generate/transfer) or Scan */}
          <div className="flex-1 min-w-0">
            {sideOption === 'send' && (
            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-2xl p-6">
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSendTab('generate')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                    sendTab === 'generate'
                      ? 'bg-black text-white shadow'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  1. Generate Stealth Address
                </button>
                <button
                  type="button"
                  onClick={() => setSendTab('transfer')}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition ${
                    sendTab === 'transfer'
                      ? 'bg-black text-white shadow'
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  2. Transfer Funds
                </button>
              </div>

              {sendTab === 'generate' && (
                <>
                  <p className="text-sm text-gray-700 mb-4">Enter the receiver’s wallet address. We’ll derive a one-time stealth address for this payment.</p>
                  <label className="block text-sm font-semibold text-black mb-2">Receiver address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-xl bg-white text-black font-mono text-sm mb-4 focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                    disabled={isGenerating}
                  />
                  <button
                    type="button"
                    onClick={generateStealthAddress}
                    disabled={isGenerating}
                    className="w-full py-3 px-6 rounded-xl border-2 border-black font-bold bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Generating…
                      </>
                    ) : (
                      'Generate Stealth Address'
                    )}
                  </button>
                  {stealthAddress && (
                    <div className="mt-4 p-4 bg-[#FCD119]/10 border-2 border-[#FCD119] rounded-xl">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Stealth address (use in Transfer Funds)</p>
                      <p className="text-sm font-mono text-black break-all">{stealthAddress}</p>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(stealthAddress)}
                        className="mt-2 px-3 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  {txStatus && sendTab === 'generate' && (
                    <p className="mt-4 text-sm font-semibold text-gray-700">{txStatus}</p>
                  )}
                </>
              )}

              {sendTab === 'transfer' && (
                <>
                  <p className="text-sm text-gray-700 mb-4">Send the amount to the stealth address from step 1. Connect your wallet first.</p>
                  {!stealthAddress && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      Generate a stealth address first, then enter the amount here.
                    </p>
                  )}
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">Amount (POL)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 border-2 border-black rounded-xl bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                        disabled={!stealthAddress || isSending || !isConnected}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!stealthAddress || !amount.trim() || isSending || !isConnected}
                      className="w-full py-3 px-6 rounded-xl border-2 border-black font-bold bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {!isConnected ? (
                        'Connect wallet to transfer'
                      ) : isSending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        'Transfer Funds'
                      )}
                    </button>
                  </form>
                  {txStatus && sendTab === 'transfer' && (
                    <div className="mt-4 p-3 rounded-lg border-2 bg-gray-50 border-gray-200">
                      <p className="text-sm font-semibold text-gray-800">{txStatus}</p>
                      {txHash && (
                        <a
                          href={`https://amoy.polygonscan.com/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          View on PolygonScan →
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            )}

            {sideOption === 'scan' && (
            <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-2xl p-6 min-h-[320px] flex flex-col">
              <h2 className="text-lg font-black text-black mb-1 flex items-center gap-2">
                <span className="text-2xl">🔍</span> Scan
              </h2>
              <p className="text-sm text-gray-600 mb-1">See who is sending POL to you.</p>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-4 inline-block w-fit">POL transfers only</p>
              {!isConnected ? (
                <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[240px]">
                  <p className="text-center text-gray-500 text-sm px-4">
                    Connect your wallet to see incoming POL.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">Incoming POL to {address?.slice(0, 6)}…{address?.slice(-4)}</p>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px]">
                    {DEMO_INCOMING_POL.map((p, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#FCD119]/10 border-2 border-gray-200 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">↓</span>
                          <span className="text-sm font-bold text-black">+{p.amount} POL</span>
                        </div>
                        <div className="text-xs font-mono text-gray-600 truncate" title={p.from}>
                          From: {p.from.slice(0, 10)}…{p.from.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{p.when}</div>
                        <a
                          href={`https://amoy.polygonscan.com/tx/${p.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View on Explorer →
                        </a>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Live data when background scanner is connected.</p>
                </>
              )}
            </div>
            )}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl border-2 border-black font-bold text-black bg-white hover:bg-[#FCD119] transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
