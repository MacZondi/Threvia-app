const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: npx hardhat run scripts/mint.cjs --network baseSepolia <TOKEN_ADDRESS> <AMOUNT>");
    process.exit(1);
  }

  const tokenAddress = args[0];
  const amountToMint = args[1]; // in ether units (e.g., "1000" = 1000 * 10^18)

  console.log(`🪙 Minting ${amountToMint} THREV tokens...\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Account:", deployer.address);

  const ThreviaToken = await hre.ethers.getContractFactory("ThreviaToken");
  const token = ThreviaToken.attach(tokenAddress);

  const amount = hre.ethers.parseEther(amountToMint);
  const tx = await token.mint(deployer.address, amount);

  console.log("Transaction hash:", tx.hash);
  console.log("Waiting for confirmation...");

  await tx.wait();

  console.log("\n✅ Tokens minted successfully!");
  const balance = await token.balanceOf(deployer.address);
  console.log("New balance:", hre.ethers.formatEther(balance), "THREV");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:", error);
    process.exit(1);
  });
