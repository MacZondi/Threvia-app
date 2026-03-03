const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ThreviaToken to Base Sepolia...\n");

  const ThreviaToken = await hre.ethers.getContractFactory("ThreviaToken");
  const token = await ThreviaToken.deploy();

  await token.deploymentTransaction().wait(1);

  console.log("✅ ThreviaToken deployed successfully!");
  console.log("📋 Save this information:\n");
  console.log("   Contract Address: " + token.target);
  console.log("   Network: Base Sepolia (Testnet)");
  console.log("   Chain ID: 84532");
  console.log("   RPC URL: https://sepolia.base.org");
  console.log("   Symbol: THREV");
  console.log("   Decimals: 18\n");

  console.log("🔍 Waiting for block confirmations before verification...");
  await token.deploymentTransaction().wait(6);

  // Attempt to verify
  try {
    console.log("\n🔐 Verifying contract on BaseScan...");
    await hre.run("verify:verify", {
      address: token.target,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on BaseScan!");
  } catch (error) {
    console.log("⚠️  Verification skipped. You can verify manually on BaseScan.");
  }

  // Return contract address
  return token.target;
}

main()
  .then((address) => {
    console.log("\n✨ Deployment complete!");
    console.log("🎉 Update your backend .env with:");
    console.log(`THREVIA_TOKEN_ADDRESS=${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
