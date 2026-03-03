const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying ThreviaToken to", hre.network.name);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);

  // Deploy contract
  const ThreviaToken = await hre.ethers.getContractFactory("ThreviaToken");
  const contract = await ThreviaToken.deploy();
  await contract.waitForDeployment();

  const deploymentAddress = await contract.getAddress();
  console.log(`✅ ThreviaToken deployed to: ${deploymentAddress}`);

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  // Save deployment info
  const deploymentInfo = {
    contract: "ThreviaToken",
    network: hre.network.name,
    address: deploymentAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment saved to deployments/${hre.network.name}.json`);

  // Verify deployment
  const totalSupply = await contract.totalSupply();
  console.log(`📊 Total Supply: ${hre.ethers.formatUnits(totalSupply, 18)} THREV`);

  return deploymentAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
