import { ethers } from "hardhat";

// cUSD addresses per network
// Alfajores: https://docs.celo.org/learn/celo-tokens#contract-addresses
const CUSD_ADDRESSES: Record<number, string> = {
  44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // Alfajores cUSD
  42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // Mainnet cUSD
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const cusd = CUSD_ADDRESSES[chainId];
  if (!cusd) {
    throw new Error(`Unsupported chainId ${chainId}. Add its cUSD address to CUSD_ADDRESSES.`);
  }

  console.log("Deploying with:", deployer.address, "on chainId:", chainId);

  // Deploy FarmerRegistry
  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.waitForDeployment();
  const farmerRegistryAddress = await farmerRegistry.getAddress();
  console.log("FarmerRegistry deployed:", farmerRegistryAddress);

  // Deploy PremiumPool(cUSD, farmerRegistry)
  const PremiumPool = await ethers.getContractFactory("PremiumPool");
  const premiumPool = await PremiumPool.deploy(cusd, farmerRegistryAddress);
  await premiumPool.waitForDeployment();
  const premiumPoolAddress = await premiumPool.getAddress();
  console.log("PremiumPool deployed:", premiumPoolAddress);

  // Deploy PayoutManager(cUSD, farmerRegistry)
  const PayoutManager = await ethers.getContractFactory("PayoutManager");
  const payoutManager = await PayoutManager.deploy(cusd, farmerRegistryAddress);
  await payoutManager.waitForDeployment();
  const payoutManagerAddress = await payoutManager.getAddress();
  console.log("PayoutManager deployed:", payoutManagerAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



