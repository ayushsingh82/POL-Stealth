'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useChainId, useSignMessage, useBalance } from 'wagmi';
import { parseEther, isAddress } from 'viem';
import { createStealthAddress, predictStealthSafeAddress, claimFromStealthAddress } from '../../helper/fluid';

export default function LaunchPage() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [transferStatus, setTransferStatus] = useState('');
  const [stealthAddress, setStealthAddress] = useState<string>('');
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>('');
  const [isGeneratingStealth, setIsGeneratingStealth] = useState(false);
  const [stealthAddressToSend, setStealthAddressToSend] = useState<string>('');
  const [stealthAddressToClaim, setStealthAddressToClaim] = useState<string>('');
  const [canClaim, setCanClaim] = useState<boolean | null>(null);

  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  
  // Get user balance
  const { data: balance } = useBalance({
    address: userAddress,
  });

  // Send transaction
  const { 
    data: hash,
    error, 
    isPending, 
    sendTransaction 
  } = useSendTransaction();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transfer success
  useEffect(() => {
    if (isSuccess && hash) {
      setTransferStatus(`✅ Transfer completed successfully! Hash: ${hash}`);
      // Reset form
      setAddress('');
      setAmount('');
    }
  }, [isSuccess, hash]);

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Transaction error:', error);
      setTransferStatus(`❌ Transfer failed: ${error.message}`);
    }
  }, [error]);

  // Handle pending state
  useEffect(() => {
    if (isPending) {
      setTransferStatus('⏳ Transaction pending... Please confirm in your wallet');
    }
  }, [isPending]);

  // Handle confirming state
  useEffect(() => {
    if (isConfirming) {
      setTransferStatus('⏳ Transaction confirmed! Waiting for blockchain confirmation...');
    }
  }, [isConfirming]);

  // Generate stealth address when wallet connects
  useEffect(() => {
    if (isConnected && userAddress && chainId === 845320009) { // Horizen testnet chain ID
      generateStealthAddress();
    }
  }, [isConnected, userAddress, chainId]);

  const generateStealthAddress = async () => {
    if (!userAddress) return;
    
    try {
      setIsGeneratingStealth(true);
      setTransferStatus('Generating stealth address...');
      
      // Create a signer object for fluid stealth address generation
      const signer = {
        signMessage: async (message: string) => {
          console.log('Signing message:', message);
          const signature = await signMessageAsync({ message });
          console.log('Signature received:', signature);
          return signature;
        }
      };
      
      console.log('Starting stealth address generation...');
      
      // Generate stealth address using fluid helper
      const stealthAddr = await createStealthAddress(signer, []);
      console.log('Stealth address generated:', stealthAddr);
      
      // Predict Safe address
      const safeAddr = await predictStealthSafeAddress([stealthAddr]);
      console.log('Safe address predicted:', safeAddr);
      
      if (stealthAddr) {
        setStealthAddress(stealthAddr);
        setStealthMetaAddress(safeAddr.stealthSafeAddress);
        setTransferStatus('✅ Stealth address generated successfully!');
      } else {
        throw new Error('No stealth address was generated');
      }
      
    } catch (error) {
      console.error('Error generating stealth address:', error);
      setTransferStatus(`Failed to generate stealth address: ${(error as Error).message}`);
    } finally {
      setIsGeneratingStealth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setTransferStatus('Please connect your wallet first');
      return;
    }

    if (!address || !amount) {
      setTransferStatus('Please fill in all required fields');
      return;
    }

    try {
      setTransferStatus('Initiating transfer...');

      // Validate address
      if (!isAddress(address)) {
        throw new Error('Invalid recipient address');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to wei
      const value = parseEther(amount);

      // Check if user has enough balance
      if (balance && balance.value < value) {
        throw new Error(`Insufficient balance. You have ${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}, but trying to send ${amount} ${balance.symbol}`);
      }

      console.log('Sending transaction:', {
        to: address,
        value: value.toString(),
        amount: amount
      });

      // Send transaction
      sendTransaction({ 
        to: address as `0x${string}`, 
        value 
      });

      setTransferStatus('Transaction sent! Waiting for confirmation...');

    } catch (error) {
      console.error('Transfer error:', error);
      setTransferStatus(`Transfer failed: ${(error as Error).message}`);
    }
  };

  const handleStealthSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setTransferStatus('Please connect your wallet first');
      return;
    }

    if (!stealthAddressToSend || !amount) {
      setTransferStatus('Please fill in all required fields');
      return;
    }

    try {
      setTransferStatus('Initiating stealth transfer...');

      // Validate stealth address format
      if (!stealthAddressToSend.startsWith('0x') || stealthAddressToSend.length !== 42) {
        throw new Error('Invalid stealth address format');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to wei
      const value = parseEther(amount);

      // Check if user has enough balance
      if (balance && balance.value < value) {
        throw new Error(`Insufficient balance. You have ${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}, but trying to send ${amount} ${balance.symbol}`);
      }

      console.log('Sending stealth transaction:', {
        to: stealthAddressToSend,
        value: value.toString(),
        amount: amount
      });

      // Send transaction to stealth address
      sendTransaction({ 
        to: stealthAddressToSend as `0x${string}`, 
        value 
      });

      setTransferStatus('Stealth transaction sent! Waiting for confirmation...');

    } catch (error) {
      console.error('Stealth transfer error:', error);
      setTransferStatus(`Stealth transfer failed: ${(error as Error).message}`);
    }
  };

  const handleClaimCheck = async () => {
    if (!userAddress || !stealthAddressToClaim) return;
    
    try {
      setTransferStatus('Checking if you can claim funds...');
      
      const signer = {
        signMessage: async (message: string) => {
          return await signMessageAsync({ message });
        }
      };
      
      const claimResult = await claimFromStealthAddress(signer, stealthAddressToClaim as `0x${string}`);
      
      setCanClaim(claimResult.canClaim);
      
      if (claimResult.canClaim) {
        setTransferStatus('✅ You can claim funds from this stealth address!');
      } else {
        setTransferStatus('❌ This stealth address does not belong to your wallet.');
      }
      
    } catch (error) {
      console.error('Error checking claim:', error);
      setTransferStatus(`Claim check failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Zen-Stealth Logo/Header */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="focus:outline-none">
          <div className="bg-[#FCD119] border-2 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] px-6 py-3 rounded-lg cursor-pointer">
            <h1 className="text-2xl font-black text-black">Zen-Stealth</h1>
          </div>
        </Link>
      </div>
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-6xl h-64 bg-gradient-to-r from-[#FAF7C0] via-[#FCF569] to-[#FEDE27] rounded-b-[50%] shadow-2xl flex items-end justify-center pb-8">
            <div className="text-center">
            <p className="text-sm font-black mb-4 text-white bg-black px-3 py-2 rounded-lg inline-block">Experience the Future of</p>
            <h3 className="text-4xl font-bold font-black text-black italic mb-1">
                Stealth Account
              </h3>
              <h2 className="text-lg font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block italic">on Horizen</h2>
            </div>
          </div>

          {/* BOX 4 - Claim Funds */}
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-lg">
            <h2 className="text-xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">
              Claim Stealth Funds
            </h2>
            <p className="text-xs text-black mb-4">
              Check if you can claim funds from a stealth address
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="claimAddress" className="block text-sm font-bold text-black mb-2">
                  Stealth Address to Check
                </label>
                <input
                  type="text"
                  id="claimAddress"
                  value={stealthAddressToClaim}
                  onChange={(e) => setStealthAddressToClaim(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black bg-white text-black placeholder-gray-500"
                />
              </div>
              
              <button
                onClick={handleClaimCheck}
                disabled={!isConnected || !stealthAddressToClaim}
                className="w-full py-2 px-3 bg-[#FCD119] border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-bold text-black hover:bg-[#FCD119]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check if I Can Claim
              </button>
              
              {canClaim !== null && (
                <div className={`p-3 rounded-md text-sm font-medium ${
                  canClaim 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {canClaim 
                    ? '✅ You can claim funds from this stealth address!' 
                    : '❌ This stealth address does not belong to your wallet.'
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20 mt-16">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* BOX 1 - Stealth Account Info */}
          <div className="bg-[#FCD119] border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-lg">
            <h2 className="text-xl font-black mb-4 text-white bg-black px-3 py-2 rounded-lg inline-block">
              Stealth Account
            </h2>
            <div className="mb-3 p-2 bg-black text-white rounded text-xs">
              <p className="font-bold">ℹ️ How Stealth Addresses Work:</p>
              <p>• Stealth addresses are for RECEIVING funds privately</p>
              <p>• When you SEND, it shows your regular address on explorer</p>
              <p>• Use stealth address to receive anonymous payments</p>
            </div>
            
            {isConnected ? (
              <div className="space-y-4">
                <div className="text-center p-2 bg-black text-white rounded text-xs">
                  Chain ID: {chainId} {chainId === 845320009 ? '✓ Horizen Testnet' : '⚠️ Wrong Network'}
                </div>
                
                {chainId !== 845320009 ? (
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-bold">Please switch to Horizen Testnet</p>
                    <p className="text-xs text-black">Chain ID: 845320009</p>
                  </div>
                ) : isGeneratingStealth ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                    <p className="text-sm text-black">Generating stealth address...</p>
                  </div>
                ) : stealthAddress ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold text-black mb-1">Your Stealth Address:</p>
                      <div className="flex gap-2">
                        <p className="text-xs font-mono bg-black text-white p-2 rounded break-all flex-1">
                          {stealthAddress}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(stealthAddress);
                            setTransferStatus('Stealth address copied!');
                          }}
                          className="px-3 py-2 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-black mt-1 italic">
                        Share this address to receive private payments
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black mb-1">Stealth Safe Address:</p>
                      <p className="text-xs font-mono bg-black text-white p-2 rounded break-all">
                        {stealthMetaAddress}
                      </p>
                    </div>
                    <button
                      onClick={generateStealthAddress}
                      className="w-full py-2 px-3 bg-black text-white text-sm font-bold rounded hover:bg-gray-800 transition-colors"
                    >
                      Generate New Stealth Address
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-black">Click to generate stealth address</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-black">Connect your wallet to generate stealth addresses</p>
            )}
          </div>

          {/* BOX 2 - Privacy Features */}
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-lg">
            <h2 className="text-xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">
              FluidKey account kit
            </h2>
            <p className="text-sm text-black mb-4 leading-relaxed">
              Advanced privacy features using ERC-5564 stealth addresses:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-3 bg-black"></span>
                <span className="text-black font-semibold">One-time use addresses</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-3 bg-black"></span>
                <span className="text-black font-semibold">View tags for efficient scanning</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-3 bg-black"></span>
                <span className="text-black font-semibold">Ephemeral key generation</span>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-3 bg-black"></span>
                <span className="text-black font-semibold">SECP256k1 cryptography</span>
              </li>
            </ul>
          </div>

          {/* BOX 3 - Transfer Form */}
          <div className="bg-white border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-lg">
            <h2 className="text-xl font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">
              Send Privately
            </h2>
            
            <div className="mb-6 flex justify-center">
              <ConnectButton />
            </div>
            
            {/* Balance Display */}
            {isConnected && balance && (
              <div className="mb-4 p-3 bg-gray-100 border-2 border-black rounded-md text-center">
                <p className="text-sm font-bold text-black">
                  Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </p>
                <p className="text-xs text-gray-600">
                  Address: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-black mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black bg-white text-black placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-bold text-black mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.001"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black bg-white text-black placeholder-gray-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isPending || !isConnected}
                className="w-full py-3 px-4 border-2 border-black rounded-md shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-sm font-bold text-black bg-[#FCD119] hover:bg-[#FCD119]/90 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCD119] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Processing...' : 'Send Transaction'}
              </button>
            </form>

            {/* Stealth Send Form */}
            <div className="mt-6 pt-6 border-t-2 border-black">
              <h3 className="text-lg font-black mb-4 text-[#FCD119] bg-black px-3 py-2 rounded-lg inline-block">
                Send to Stealth Address
              </h3>
              <p className="text-xs text-black mb-4">
                Paste a stealth address to send funds privately
              </p>
              
              <form onSubmit={handleStealthSend} className="space-y-4">
                <div>
                  <label htmlFor="stealthAddress" className="block text-sm font-bold text-black mb-2">
                    Stealth Address
                  </label>
                  <input
                    type="text"
                    id="stealthAddress"
                    value={stealthAddressToSend}
                    onChange={(e) => setStealthAddressToSend(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black bg-white text-black placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stealthAmount" className="block text-sm font-bold text-black mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    id="stealthAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.1"
                    step="0.001"
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black rounded-md shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:border-black bg-white text-black placeholder-gray-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isPending || !isConnected}
                  className="w-full py-3 px-4 border-2 border-black rounded-md shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-sm font-bold text-black bg-[#FCD119] hover:bg-[#FCD119]/90 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FCD119] transition-all duration-200 active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Processing...' : 'Send to Stealth Address'}
                </button>
              </form>
            </div>

            {/* Status Messages */}
            {transferStatus && (
              <div className={`mt-4 p-3 rounded-md text-sm font-medium ${
                transferStatus.includes('failed') || transferStatus.includes('error') 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}>
                {transferStatus}
              </div>
            )}

            {/* Transaction Status */}
            {hash && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-600 mb-2">
                  Transaction Hash: {hash}
                </p>
                <a 
                  href={`https://horizen-explorer-testnet.appchain.base.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  🔍 View on Horizen Explorer
                </a>
              </div>
            )}
            {isConfirming && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-600">
                  Waiting for confirmation...
                </p>
              </div>
            )}
          </div>
        </div>

       
      </div>
    </div>
  );
}