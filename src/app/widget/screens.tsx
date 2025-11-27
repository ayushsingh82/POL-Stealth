"use client";
import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { BackgroundBeams } from '../../components/ui/background-beams';
import imagesJson from './images.json';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, isAddress } from 'viem';
const images: Record<string, string> = imagesJson;

const CHAINS = [

  { label: 'Polygon', value: 'Polygon' },
];
const TOKENS = [


  { name: 'USDT', chain: 'Polygon', label: 'Tether (USDT)' },
  { name: 'USDC', chain: 'Polygon', label: 'USD Coin (USDC)' },
  { name: 'POL', chain: 'Polygon', label: 'Polygon (POL)' },
 
];

export function Fns({ showHistory, setShowHistory, showWalletModal, setShowWalletModal }: { showHistory: boolean; setShowHistory: (show: boolean) => void; showWalletModal?: boolean; setShowWalletModal?: (show: boolean) => void }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [step, setStep] = useState(1);
  const [walletType, setWalletType] = useState<'personal' | 'merchant' | null>(null);
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [payOrReceive, setPayOrReceive] = useState<'pay' | 'receive' | null>(null);
  const [stealthAddress, setStealthAddress] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  
  // Batch transaction state for teams
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [batchAmount, setBatchAmount] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // Team management state
  type TeamMemberRole = 'admin' | 'member' | 'viewer';
  interface TeamMember {
    id: string;
    address: string;
    role: TeamMemberRole;
    name: string;
  }
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberRole>('member');

  // Button requirements
  const canNextStep1 = !!walletType;
  const canNextStep2 = !!selectedChain && !!selectedToken;
  
  // Initialize current user as admin if team mode
  useEffect(() => {
    if (walletType === 'merchant' && address && teamMembers.length === 0) {
      setTeamMembers([{
        id: '1',
        address: address,
        role: 'admin',
        name: 'You'
      }]);
    }
  }, [walletType, address]);

  // Auto-set to pay mode for teams
  useEffect(() => {
    if (walletType === 'merchant' && step === 3) {
      setPayOrReceive('pay');
    }
  }, [walletType, step]);

  // Generate stealth address function
  const generateStealthAddress = async () => {
    setIsGenerating(true);
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a more realistic-looking stealth address
      const generateRealisticAddress = () => {
        const chars = '0123456789abcdef';
        let address = '0x';
        
        // Generate 40 characters (20 bytes) for a realistic Ethereum address
        for (let i = 0; i < 40; i++) {
          address += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Ensure it starts with common patterns found in real addresses
        const prefixes = ['1a', '2b', '3c', '4d', '5e', '6f', '7a', '8b', '9c', '0d'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        return address.substring(0, 4) + randomPrefix + address.substring(6);
      };
      
      const stealthAddress = generateRealisticAddress();
      setStealthAddress(stealthAddress);
    } catch (error) {
      console.error('Error generating stealth address:', error);
      setStealthAddress('Error generating address');
    } finally {
      setIsGenerating(false);
    }
  };

  // Team management functions
  const handleAddTeamMember = () => {
    if (!newMemberAddress || !isAddress(newMemberAddress)) {
      alert('Please enter a valid wallet address');
      return;
    }
    
    if (teamMembers.some(m => m.address.toLowerCase() === newMemberAddress.toLowerCase())) {
      alert('This wallet address is already added to the team');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      address: newMemberAddress,
      role: newMemberRole,
      name: newMemberName || `Member ${teamMembers.length}`
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberAddress('');
    setNewMemberName('');
    setNewMemberRole('member');
    setShowAddMember(false);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    if (teamMembers.find(m => m.id === memberId)?.role === 'admin' && 
        teamMembers.filter(m => m.role === 'admin').length === 1) {
      alert('Cannot remove the last admin');
      return;
    }
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const handleUpdateMemberRole = (memberId: string, newRole: TeamMemberRole) => {
    if (teamMembers.find(m => m.id === memberId)?.role === 'admin' && 
        teamMembers.filter(m => m.role === 'admin').length === 1 && newRole !== 'admin') {
      alert('Cannot remove the last admin');
      return;
    }
    setTeamMembers(teamMembers.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));
  };

  // Handle batch transaction for teams
  const handleBatchTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletClient || !address) {
      setTransactionStatus('Please connect your wallet first');
      return;
    }

    if (selectedTeamMembers.length === 0 || !batchAmount) {
      setTransactionStatus('Please select at least one team member and enter amount');
      return;
    }

    try {
      setIsSendingTransaction(true);
      setTransactionStatus('Validating batch transaction...');

      // Validate amount
      const amountNum = parseFloat(batchAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to wei
      const value = parseEther(batchAmount);
      const totalValue = value * BigInt(selectedTeamMembers.length);

      setTransactionStatus(`Sending ${selectedTeamMembers.length} transaction(s)... Please confirm in your wallet`);

      // Send transactions to all selected members
      const hashes: string[] = [];
      for (const memberAddress of selectedTeamMembers) {
        const hash = await walletClient.sendTransaction({
          account: address,
          to: memberAddress as `0x${string}`,
          value
        });
        hashes.push(hash);
      }

      setTransactionHash(hashes[0]); // Show first hash
      setTransactionStatus(`✅ Batch transaction sent! ${selectedTeamMembers.length} transaction(s) completed. Hash: ${hashes[0]}`);
      
      // Reset form
      setSelectedTeamMembers([]);
      setBatchAmount('');

    } catch (error) {
      console.error('Batch transaction error:', error);
      setTransactionStatus(`❌ Batch transaction failed: ${(error as Error).message}`);
    } finally {
      setIsSendingTransaction(false);
    }
  };

  // Toggle team member selection for batch
  const toggleTeamMemberSelection = (memberAddress: string) => {
    if (selectedTeamMembers.includes(memberAddress)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(addr => addr !== memberAddress));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, memberAddress]);
    }
  };

  // Handle send transaction
  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !walletClient || !address) {
      setTransactionStatus('Please connect your wallet first');
      return;
    }

    if (!recipientAddress || !amount) {
      setTransactionStatus('Please fill in all required fields');
      return;
    }

    try {
      setIsSendingTransaction(true);
      setTransactionStatus('Validating transaction...');

      // Validate address
      if (!isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to wei (POL is native token, so we use value)
      const value = parseEther(amount);

      setTransactionStatus('Sending transaction... Please confirm in your wallet');

      // Send transaction using viem walletClient
      const hash = await walletClient.sendTransaction({
        account: address,
        to: recipientAddress as `0x${string}`,
        value
      });

      setTransactionHash(hash);
      setTransactionStatus(`✅ Transaction sent! Hash: ${hash}`);
      
      // Reset form
      setRecipientAddress('');
      setAmount('');

    } catch (error) {
      console.error('Transaction error:', error);
      setTransactionStatus(`❌ Transaction failed: ${(error as Error).message}`);
    } finally {
      setIsSendingTransaction(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* History Screen */}
      {showHistory ? (
        <div className="w-full max-w-md bg-white/90 border-2 border-black border-r-8 border-b-8 rounded-3xl p-10 backdrop-blur-sm mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black">Transaction History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 rounded-lg cursor-pointer text-base font-bold text-black hover:bg-[#FCD119] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
            >
              Back
            </button>
          </div>
          {isConnected && address && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="text-sm font-semibold text-black mb-2">Connected Wallet</div>
              <div className="text-xs text-gray-600 font-mono mb-2">{address}</div>
              <a 
                href={`https://amoy.polygonscan.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                View on PolygonScan →
              </a>
            </div>
          )}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Sample Transactions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">↓</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">Received</div>
                  <div className="text-xs text-gray-600 font-mono">0x742d...d8b2</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-sm font-bold text-green-600">+100 USDC</div>
                <div className="text-xs text-gray-500">Private</div>
                <a 
                  href={`https://Polygon-explorer-testnet.appchain.base.org/address/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b2`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                >
                  View on Explorer
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">↑</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">Sent</div>
                  <div className="text-xs text-gray-600 font-mono">0x809c...dad62</div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-sm font-bold text-red-600">-50 USDC</div>
                <div className="text-xs text-gray-500">Private</div>
                <a 
                  href={`https://Polygon-explorer-testnet.appchain.base.org/address/0x809cccfc6a780d68d136b52dced63ed1f14dad62`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                >
                  View on Explorer
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">↓</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">Received</div>
                  <div className="text-xs text-gray-600 font-mono">0x3a1f...9e4c</div>
                  <div className="text-xs text-gray-500">3 days ago</div>
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="text-sm font-bold text-green-600">+250 USDC</div>
                <div className="text-xs text-gray-500">Private</div>
                <a 
                  href={`https://Polygon-explorer-testnet.appchain.base.org/address/0x3a1f5b8c9d4e2f6a7b9c0d1e2f3a4b5c6d7e8f9a`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                >
                  View on Explorer
                </a>
              </div>
            </div>
            
            {/* Empty state when no transactions */}
            <div className="text-center py-4 text-gray-500 text-sm">
              No more transactions to display
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Heading and subtitle OUTSIDE the box */}
          {step === 1 && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold mb-2 mt-6 text-black tracking-tight">Create Account</h2>
          <p className="text-base text-gray-700">Set up your wallet to get started</p>
        </div>
      )}
      {step === 4 && walletType === 'merchant' && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-extrabold mb-2 mt-6 text-black tracking-tight">Team Setup</h2>
          <p className="text-base text-gray-700">Add team members and manage access levels</p>
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
            {walletType === 'merchant' ? (
              // Team mode - only batch transactions
              <div className="mt-4 w-full">
                <div className="text-black font-bold text-lg mb-4">Send to Team Members</div>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    className={`px-4 py-2 rounded-lg border-2 border-black font-semibold text-sm ${
                      isBatchMode ? 'bg-[#FCD119] text-black' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {isBatchMode ? 'Single Transaction' : 'Batch Transaction'}
                  </button>
                </div>

                {isBatchMode ? (
                  // Batch transaction form
                  <form onSubmit={handleBatchTransaction} className="flex flex-col gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 max-h-[200px] overflow-y-auto">
                      <div className="text-sm font-semibold text-black mb-3">Select Team Members:</div>
                      {teamMembers.filter(m => m.address.toLowerCase() !== address?.toLowerCase()).map((member) => (
                        <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTeamMembers.includes(member.address)}
                            onChange={() => toggleTeamMemberSelection(member.address)}
                            className="w-4 h-4 border-2 border-black rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-black">{member.name}</div>
                            <div className="text-xs text-gray-600 font-mono">{member.address.slice(0, 6)}...{member.address.slice(-4)}</div>
                          </div>
                        </label>
                      ))}
                      {teamMembers.filter(m => m.address.toLowerCase() !== address?.toLowerCase()).length === 0 && (
                        <div className="text-sm text-gray-500 text-center py-4">No team members to send to. Add members in team setup.</div>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="Amount per member (POL)"
                      step="any"
                      value={batchAmount}
                      onChange={(e) => setBatchAmount(e.target.value)}
                      className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                      disabled={isSendingTransaction}
                    />
                    {selectedTeamMembers.length > 0 && batchAmount && (
                      <div className="text-sm text-gray-700 p-2 bg-blue-50 rounded border-2 border-blue-200">
                        Total: {selectedTeamMembers.length} × {batchAmount} POL = {(parseFloat(batchAmount || '0') * selectedTeamMembers.length).toFixed(4)} POL
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSendingTransaction || selectedTeamMembers.length === 0 || !batchAmount}
                      className="w-full px-6 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                    >
                      {isSendingTransaction ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Sending Batch Transaction...
                        </>
                      ) : (
                        `Send to ${selectedTeamMembers.length} Member(s)`
                      )}
                    </button>
                    {transactionStatus && (
                      <div className={`p-3 rounded-lg border-2 ${
                        transactionStatus.includes('✅') 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : transactionStatus.includes('❌')
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                        <div className="text-sm font-semibold">{transactionStatus}</div>
                        {transactionHash && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            View on PolygonScan →
                          </a>
                        )}
                      </div>
                    )}
                  </form>
                ) : (
                  // Single transaction form for teams
                  <form onSubmit={handleSendTransaction} className="flex flex-col gap-4">
                    <div className="mb-2">
                      <label className="block mb-2 text-sm font-semibold text-black">Select Team Member:</label>
                      <select
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                        disabled={isSendingTransaction}
                      >
                        <option value="">Select a team member</option>
                        {teamMembers.filter(m => m.address.toLowerCase() !== address?.toLowerCase()).map((member) => (
                          <option key={member.id} value={member.address}>
                            {member.name} ({member.address.slice(0, 6)}...{member.address.slice(-4)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      placeholder="Amount (POL)"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                      disabled={isSendingTransaction}
                    />
                    <button
                      type="submit"
                      disabled={isSendingTransaction || !recipientAddress || !amount}
                      className="w-full px-6 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                    >
                      {isSendingTransaction ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Sending Transaction...
                        </>
                      ) : (
                        'Send Transaction'
                      )}
                    </button>
                    {transactionStatus && (
                      <div className={`p-3 rounded-lg border-2 ${
                        transactionStatus.includes('✅') 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : transactionStatus.includes('❌')
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                        <div className="text-sm font-semibold">{transactionStatus}</div>
                        {transactionHash && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            View on PolygonScan →
                          </a>
                        )}
                      </div>
                    )}
                  </form>
                )}
              </div>
            ) : (
              // Personal mode - Pay or Receive
              <>
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
              <form onSubmit={handleSendTransaction} className="flex flex-col gap-4 mt-4 w-full">
                <input
                  type="text"
                  placeholder="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                  disabled={isSendingTransaction}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 border-2 border-black rounded-xl text-lg bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                  disabled={isSendingTransaction}
                />
                <button
                  type="submit"
                  disabled={isSendingTransaction || !recipientAddress || !amount}
                  className="w-full px-6 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {isSendingTransaction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Sending Transaction...
                    </>
                  ) : (
                    'Send Transaction'
                  )}
                </button>
                {transactionStatus && (
                  <div className={`p-3 rounded-lg border-2 ${
                    transactionStatus.includes('✅') 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : transactionStatus.includes('❌')
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="text-sm font-semibold">{transactionStatus}</div>
                    {transactionHash && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                      >
                        View on PolygonScan →
                      </a>
                    )}
                  </div>
                )}
              </form>
            )}
            {payOrReceive === 'receive' && (
              <div className="mt-4 w-full">
                <div className="text-center text-black font-semibold text-lg mb-4">
                  Generate your stealth address
                </div>
                <button
                  onClick={generateStealthAddress}
                  disabled={isGenerating}
                  className="w-full px-6 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Generating Private Address...
                    </>
                  ) : (
                    <>
                      🔒 Generate Stealth Address
                    </>
                  )}
                </button>
                {stealthAddress && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#FCD119]/10 to-yellow-100/20 border-2 border-[#FCD119] rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-sm font-bold text-green-700">Stealth Address Generated</div>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Your Private Receiving Address:</div>
                    <div className="text-xs font-mono text-black break-all bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                      {stealthAddress}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(stealthAddress)}
                        className="flex-1 px-3 py-2 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                      >
                        📋 Copy Address
                      </button>
                      <button
                        onClick={() => {
                          const qrText = `ethereum:${stealthAddress}`;
                          // In a real implementation, you'd generate a QR code here
                          alert('QR Code feature coming soon!');
                        }}
                        className="px-3 py-2 text-xs bg-[#FCD119] text-black rounded-lg hover:bg-yellow-400 transition font-semibold"
                      >
                        📱 QR Code
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                      <strong>ℹ️ Privacy Note:</strong> This address is unique to this transaction and cannot be linked to your main wallet.
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </div>
        </div>
      ) : step === 4 && walletType === 'merchant' ? (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center mt-8">
          <div className="w-full max-w-md bg-white/90 border-2 border-black border-r-8 border-b-8 rounded-3xl p-10 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">Team Management</h2>
              <p className="text-sm text-gray-600">Manage your team members and their access levels</p>
            </div>

            {/* Team Members List */}
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-black">{member.name}</div>
                      <div className="text-xs text-gray-600 font-mono">{member.address.slice(0, 6)}...{member.address.slice(-4)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as TeamMemberRole)}
                        className="px-3 py-1 text-xs border-2 border-black rounded-lg bg-white font-semibold"
                        disabled={member.role === 'admin' && teamMembers.filter(m => m.role === 'admin').length === 1}
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      {!(member.role === 'admin' && teamMembers.filter(m => m.role === 'admin').length === 1) && (
                        <button
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      member.role === 'member' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-black'
                    }`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                    <a
                      href={`https://amoy.polygonscan.com/address/${member.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View on PolygonScan →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Member Form */}
            {showAddMember ? (
              <div className="p-4 bg-[#FCD119]/10 border-2 border-[#FCD119] rounded-xl mb-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-black">Member Name</label>
                  <input
                    type="text"
                    placeholder="Enter member name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg text-sm bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-black">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={newMemberAddress}
                    onChange={(e) => setNewMemberAddress(e.target.value)}
                    className="w-full p-2 border-2 border-black rounded-lg text-sm bg-white text-black font-mono font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-black">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as TeamMemberRole)}
                    className="w-full p-2 border-2 border-black rounded-lg text-sm bg-white text-black font-semibold focus:ring-2 focus:ring-[#FCD119] focus:border-[#FCD119] outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTeamMember}
                    className="flex-1 px-4 py-2 bg-[#FCD119] text-black rounded-lg border-2 border-black font-bold hover:bg-black hover:text-[#FCD119] transition"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMember(false);
                      setNewMemberAddress('');
                      setNewMemberName('');
                      setNewMemberRole('member');
                    }}
                    className="px-4 py-2 bg-white text-black rounded-lg border-2 border-black font-bold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full px-6 py-3 rounded-xl border-2 border-black font-bold text-lg bg-[#FCD119] text-black hover:bg-black hover:text-[#FCD119] transition shadow-md"
              >
                + Add Team Member
              </button>
            )}

            {/* Role Permissions Info */}
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="text-sm font-semibold text-black mb-2">Role Permissions:</div>
              <div className="text-xs text-gray-700 space-y-1">
                <div><strong>Admin:</strong> Full access - can add/remove members, send transactions, manage settings</div>
                <div><strong>Member:</strong> Can send transactions and view team activity</div>
                <div><strong>Viewer:</strong> Read-only access - can view transactions and team activity</div>
              </div>
            </div>
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
      {/* Navigation Buttons OUTSIDE the box, centered - only show when not in history */}
      {!showHistory && (
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
            disabled={step === 1 ? !canNextStep1 : step === 2 ? !canNextStep2 : step === 4 ? teamMembers.length === 0 : false}
            onClick={() => {
              if (step === 1 && canNextStep1) setStep(2);
              else if (step === 2 && canNextStep2) {
                if (walletType === 'merchant') {
                  setStep(4); // Go to team management for merchant
                } else {
                  setStep(3); // Go to pay/receive for personal
                }
              } else if (step === 4 && walletType === 'merchant') {
                setStep(3); // Go to pay/receive after team setup
              }
            }}
          >
            Next
          </button>
        </div>
      )}
        </>
      )}
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


