import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying StealthTransfer contract to Horizen testnet...");

  // Get the contract factory
  const StealthTransfer = await ethers.getContractFactory("StealthTransfer");
  
  // Deploy the contract
  const stealthTransfer = await StealthTransfer.deploy();
  
  // Wait for deployment to complete
  await stealthTransfer.waitForDeployment();
  
  const contractAddress = await stealthTransfer.getAddress();
  
  console.log("✅ StealthTransfer deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Horizen Testnet");
  console.log("Chain ID: 845320009");
  console.log("Explorer: https://horizen-explorer-testnet.appchain.base.org/address/" + contractAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const code = await ethers.provider.getCode(contractAddress);
  if (code !== "0x") {
    console.log("✅ Contract code deployed successfully");
  } else {
    console.log("❌ Contract deployment failed");
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 