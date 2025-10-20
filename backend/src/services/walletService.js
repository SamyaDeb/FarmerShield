const { ethers } = require('ethers');

/**
 * Authenticate wallet signature
 * @param {string} walletAddress - The wallet address
 * @param {string} signature - The signature from the wallet
 * @param {string} message - The original message that was signed
 * @returns {boolean} - Whether the signature is valid
 */
const authenticateWallet = async (walletAddress, signature, message) => {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Check if the recovered address matches the provided address
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Wallet authentication error:', error);
    return false;
  }
};

/**
 * Generate a message for wallet signing
 * @param {string} walletAddress - The wallet address
 * @param {string} action - The action being performed (login, register, etc.)
 * @returns {string} - The message to be signed
 */
const generateMessage = (walletAddress, action = 'login') => {
  const timestamp = new Date().toISOString();
  return `WeatherShield ${action} verification\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Validate Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    return false;
  }
};

/**
 * Format address for display
 * @param {string} address - The address to format
 * @returns {string} - Formatted address
 */
const formatAddress = (address) => {
  if (!isValidAddress(address)) {
    return address;
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Get wallet balance (for future use)
 * @param {string} walletAddress - The wallet address
 * @param {string} tokenAddress - The token contract address (optional)
 * @returns {Promise<Object>} - Balance information
 */
const getWalletBalance = async (walletAddress, tokenAddress = null) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL);
    
    if (tokenAddress) {
      // Get ERC20 token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals()
      ]);
      
      return {
        balance: ethers.formatUnits(balance, decimals),
        decimals: Number(decimals),
        symbol: 'cUSD' // Assuming cUSD for now
      };
    } else {
      // Get native CELO balance
      const balance = await provider.getBalance(walletAddress);
      return {
        balance: ethers.formatEther(balance),
        decimals: 18,
        symbol: 'CELO'
      };
    }
  } catch (error) {
    console.error('Get wallet balance error:', error);
    throw error;
  }
};

/**
 * Check if wallet has sufficient balance
 * @param {string} walletAddress - The wallet address
 * @param {string} amount - The required amount
 * @param {string} tokenAddress - The token contract address (optional)
 * @returns {Promise<boolean>} - Whether the wallet has sufficient balance
 */
const hasSufficientBalance = async (walletAddress, amount, tokenAddress = null) => {
  try {
    const balanceInfo = await getWalletBalance(walletAddress, tokenAddress);
    return parseFloat(balanceInfo.balance) >= parseFloat(amount);
  } catch (error) {
    console.error('Check balance error:', error);
    return false;
  }
};

module.exports = {
  authenticateWallet,
  generateMessage,
  isValidAddress,
  formatAddress,
  getWalletBalance,
  hasSufficientBalance
};
