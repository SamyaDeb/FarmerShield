const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const FarmerRegistry = await ethers.getContractFactory("FarmerRegistry");
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.deployed();

  console.log("FarmerRegistry deployed to:", farmerRegistry.address);

  const cusdTokenAddress = process.env.CUSD_TOKEN_ADDRESS;
  const PremiumPool = await ethers.getContractFactory("PremiumPool");
  const premiumPool = await PremiumPool.deploy(cusdTokenAddress, farmerRegistry.address);
  await premiumPool.deployed();

  console.log("PremiumPool deployed to:", premiumPool.address);

  const PayoutManager = await ethers.getContractFactory("PayoutManager");
  const payoutManager = await PayoutManager.deploy(cusdTokenAddress, farmerRegistry.address);
  await payoutManager.deployed();

  console.log("PayoutManager deployed to:", payoutManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
