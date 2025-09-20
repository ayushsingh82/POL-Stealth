import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying TokenTransfer contract to Horizen testnet...");

  // Get the contract factory
  const TokenTransfer = await ethers.getContractFactory("TokenTransfer");
  
  // Deploy the contract
  const tokenTransfer = await TokenTransfer.deploy();
  
  // Wait for deployment to complete
  await tokenTransfer.waitForDeployment();
  
  const contractAddress = await tokenTransfer.getAddress();
  
  console.log("✅ TokenTransfer deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Horizen Testnet");
  console.log("Chain ID: 845320009");
  console.log("Explorer: https://horizen-explorer-testnet.appchain.base.org/address/" + contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code !== "0x") {
    console.log("✅ Contract code deployed successfully");
    
    // Get owner address
    const owner = await tokenTransfer.owner();
    console.log("Contract Owner:", owner);
    
    // Display contract functions
    console.log("\n📋 Available functions:");
    console.log("- transferToken(address tokenAddress, address recipient, uint256 amount) - Transfer ERC20 tokens");
    console.log("- withdrawETH() - Withdraw accidentally sent ETH");
    console.log("- owner() - Get contract owner address");
    
  } else {
    console.log("❌ Contract deployment failed");
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 