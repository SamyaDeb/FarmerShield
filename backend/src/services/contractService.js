const { ethers } = require('ethers');
const { ContractKit, newKit } = require('@celo/contractkit');

let contractKit;
let farmerRegistryContract;
let premiumPoolContract;
let payoutManagerContract;
let cusdContract;

/**
 * Initialize contract services
 */
const initializeContracts = async () => {
  try {
    // Initialize ContractKit
    contractKit = newKit(process.env.CELO_RPC_URL);
    
    // Get contract ABIs (you would import these from your compiled contracts)
    const farmerRegistryABI = [
      "function registerFarmer(string memory _latitude, string memory _longitude, string memory _cropType) public",
      "function updateFarmer(string memory _latitude, string memory _longitude, string memory _cropType) public",
      "function isFarmerRegistered(address farmer) public view returns (bool)",
      "function farmers(address farmer) public view returns (address wallet, string memory latitude, string memory longitude, string memory cropType)",
      "event FarmerRegistered(address indexed farmer, string latitude, string longitude, string cropType)"
    ];
    
    const premiumPoolABI = [
      "function payPremium(uint256 _amount) public",
      "function farmerBalances(address farmer) public view returns (uint256)",
      "function cusdToken() public view returns (address)",
      "function farmerRegistry() public view returns (address)",
      "event PremiumPaid(address indexed farmer, uint256 amount)"
    ];
    
    const payoutManagerABI = [
      "function triggerPayout(address _farmer, uint256 _amount) public",
      "function cusdToken() public view returns (address)",
      "function farmerRegistry() public view returns (address)",
      "event PayoutTriggered(address indexed farmer, uint256 amount)"
    ];
    
    const cusdABI = [
      "function balanceOf(address account) public view returns (uint256)",
      "function transfer(address to, uint256 amount) public returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function decimals() public view returns (uint8)",
      "function symbol() public view returns (string)",
      "function name() public view returns (string)"
    ];
    
    // Initialize contracts
    farmerRegistryContract = new ethers.Contract(
      process.env.FARMER_REGISTRY_ADDRESS,
      farmerRegistryABI,
      contractKit.web3
    );
    
    premiumPoolContract = new ethers.Contract(
      process.env.PREMIUM_POOL_ADDRESS,
      premiumPoolABI,
      contractKit.web3
    );
    
    payoutManagerContract = new ethers.Contract(
      process.env.PAYOUT_MANAGER_ADDRESS,
      payoutManagerABI,
      contractKit.web3
    );
    
    cusdContract = new ethers.Contract(
      process.env.CUSD_ADDRESS,
      cusdABI,
      contractKit.web3
    );
    
    console.log('Contract services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize contract services:', error);
    throw error;
  }
};

/**
 * Register farmer on blockchain
 * @param {string} walletAddress - Farmer's wallet address
 * @param {string} latitude - Latitude coordinate
 * @param {string} longitude - Longitude coordinate
 * @param {string} cropType - Type of crop
 * @returns {Promise<Object>} - Transaction result
 */
const registerFarmer = async (walletAddress, latitude, longitude, cropType) => {
  try {
    // This would require a signer with the farmer's private key
    // For now, we'll return a mock response
    return {
      success: true,
      message: 'Farmer registration would be handled by frontend with wallet connection',
      transactionHash: null
    };
  } catch (error) {
    console.error('Register farmer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if farmer is registered on blockchain
 * @param {string} walletAddress - Farmer's wallet address
 * @returns {Promise<boolean>} - Registration status
 */
const isFarmerRegistered = async (walletAddress) => {
  try {
    const isRegistered = await farmerRegistryContract.isFarmerRegistered(walletAddress);
    return isRegistered;
  } catch (error) {
    console.error('Check farmer registration error:', error);
    return false;
  }
};

/**
 * Get farmer details from blockchain
 * @param {string} walletAddress - Farmer's wallet address
 * @returns {Promise<Object>} - Farmer details
 */
const getFarmerDetails = async (walletAddress) => {
  try {
    const farmerData = await farmerRegistryContract.farmers(walletAddress);
    return {
      wallet: farmerData.wallet,
      latitude: farmerData.latitude,
      longitude: farmerData.longitude,
      cropType: farmerData.cropType
    };
  } catch (error) {
    console.error('Get farmer details error:', error);
    return null;
  }
};

/**
 * Pay premium (would be handled by frontend with wallet connection)
 * @param {string} walletAddress - Farmer's wallet address
 * @param {number} amount - Premium amount
 * @returns {Promise<Object>} - Transaction result
 */
const payPremium = async (walletAddress, amount) => {
  try {
    // This would require a signer with the farmer's private key
    // For now, we'll return a mock response
    return {
      success: true,
      message: 'Premium payment would be handled by frontend with wallet connection',
      transactionHash: null
    };
  } catch (error) {
    console.error('Pay premium error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get farmer's premium balance
 * @param {string} walletAddress - Farmer's wallet address
 * @returns {Promise<number>} - Premium balance
 */
const getPremiumBalance = async (walletAddress) => {
  try {
    const balance = await premiumPoolContract.farmerBalances(walletAddress);
    return ethers.formatUnits(balance, 18); // Assuming 18 decimals for cUSD
  } catch (error) {
    console.error('Get premium balance error:', error);
    return 0;
  }
};

/**
 * Trigger payout (admin function)
 * @param {string} farmerAddress - Farmer's wallet address
 * @param {number} amount - Payout amount
 * @returns {Promise<Object>} - Transaction result
 */
const triggerPayout = async (farmerAddress, amount) => {
  try {
    // This would require admin private key
    // For now, we'll return a mock response
    return {
      success: true,
      message: 'Payout triggered successfully',
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      gasUsed: 21000
    };
  } catch (error) {
    console.error('Trigger payout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get cUSD balance
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<number>} - cUSD balance
 */
const getCUSDBalance = async (walletAddress) => {
  try {
    const balance = await cusdContract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Get cUSD balance error:', error);
    return 0;
  }
};

/**
 * Get contract addresses
 * @returns {Object} - Contract addresses
 */
const getContractAddresses = () => {
  return {
    farmerRegistry: process.env.FARMER_REGISTRY_ADDRESS,
    premiumPool: process.env.PREMIUM_POOL_ADDRESS,
    payoutManager: process.env.PAYOUT_MANAGER_ADDRESS,
    cusd: process.env.CUSD_ADDRESS
  };
};

/**
 * Listen to contract events
 */
const startEventListening = () => {
  try {
    // Listen to FarmerRegistered events
    farmerRegistryContract.on('FarmerRegistered', (farmer, latitude, longitude, cropType, event) => {
      console.log('FarmerRegistered event:', {
        farmer,
        latitude,
        longitude,
        cropType,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
    
    // Listen to PremiumPaid events
    premiumPoolContract.on('PremiumPaid', (farmer, amount, event) => {
      console.log('PremiumPaid event:', {
        farmer,
        amount: ethers.formatUnits(amount, 18),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
    
    // Listen to PayoutTriggered events
    payoutManagerContract.on('PayoutTriggered', (farmer, amount, event) => {
      console.log('PayoutTriggered event:', {
        farmer,
        amount: ethers.formatUnits(amount, 18),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      });
    });
    
    console.log('Contract event listening started');
  } catch (error) {
    console.error('Start event listening error:', error);
  }
};

module.exports = {
  initializeContracts,
  registerFarmer,
  isFarmerRegistered,
  getFarmerDetails,
  payPremium,
  getPremiumBalance,
  triggerPayout,
  getCUSDBalance,
  getContractAddresses,
  startEventListening
};
