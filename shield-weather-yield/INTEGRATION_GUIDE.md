# WeatherShield Integration Guide

## 🎯 What's Been Built

This repository contains a **production-ready frontend** for WeatherShield - a parametric crop insurance DApp. The UI is fully functional with:

✅ **Landing Page** - Hero section with farmer imagery, feature cards, stats, and CTAs  
✅ **Registration Flow** - Wallet connection, crop selection, GPS location, premium calculator  
✅ **Farmer Dashboard** - Real-time weather monitoring, claim history, farm details  
✅ **Design System** - Green/white theme optimized for agricultural context  
✅ **Responsive Design** - Mobile-first approach with smooth animations  

## 🔗 Next Steps: Blockchain Integration

To complete the full-stack DApp, you'll need to integrate:

### 1. Smart Contracts (Separate Repository)

Create a Hardhat project with:

```
weathershield-contracts/
├── contracts/
│   ├── FarmerRegistry.sol
│   ├── PremiumPool.sol
│   ├── PayoutManager.sol
│   └── WeatherDAO.sol (optional)
├── scripts/
│   └── deploy.js
├── hardhat.config.js
└── test/
```

**Hardhat Configuration Example:**
```javascript
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220
    }
  }
};
```

### 2. Backend API (Node.js/Express)

Create a backend service:

```
weathershield-backend/
├── src/
│   ├── routes/
│   │   ├── farmers.js
│   │   ├── payments.js
│   │   └── claims.js
│   ├── services/
│   │   ├── oracle.service.js
│   │   └── blockchain.service.js
│   ├── models/
│   │   └── Farmer.model.js
│   └── server.js
├── .env
└── package.json
```

**Key Backend Features:**
- REST API endpoints for farmer registration
- RedStone oracle integration for weather data
- CRON jobs for automated payout triggers
- Event listeners for on-chain transactions
- Database (MongoDB/PostgreSQL) for off-chain data

### 3. Connect Frontend to Backend

**Install Web3 Dependencies:**
```bash
npm install @celo/contractkit ethers wagmi
```

**Example Hook for Wallet Connection:**
```typescript
// src/hooks/useWallet.ts
import { useState, useEffect } from 'react';
import { newKit } from '@celo/contractkit';

export const useWallet = () => {
  const [address, setAddress] = useState<string>('');
  const [kit, setKit] = useState<any>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const newKit = newKit('https://alfajores-forno.celo-testnet.org');
      newKit.connection.addAccount(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAddress(accounts[0]);
      setKit(newKit);
    }
  };

  return { address, kit, connectWallet };
};
```

**Update Register.tsx:**
Replace the mock wallet connection with real blockchain interaction:
```typescript
import { useWallet } from '@/hooks/useWallet';
import FarmerRegistryABI from './contracts/FarmerRegistry.json';

const { address, kit, connectWallet } = useWallet();

const registerFarmer = async () => {
  const contract = new kit.web3.eth.Contract(
    FarmerRegistryABI,
    process.env.VITE_FARMER_REGISTRY_ADDRESS
  );
  
  await contract.methods
    .registerFarmer(cropType, location, farmSize)
    .send({ from: address });
};
```

### 4. Environment Variables

Create `.env` file:
```env
# Frontend (.env)
VITE_BACKEND_API_URL=http://localhost:3000
VITE_FARMER_REGISTRY_ADDRESS=0x...
VITE_PREMIUM_POOL_ADDRESS=0x...
VITE_PAYOUT_MANAGER_ADDRESS=0x...
VITE_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org

# Backend (.env)
DATABASE_URL=mongodb://localhost:27017/weathershield
REDSTONE_API_KEY=your_redstone_api_key
CELO_PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
```

### 5. Oracle Integration Example

**Backend Oracle Service:**
```javascript
// services/oracle.service.js
const axios = require('axios');

async function fetchWeatherData(latitude, longitude) {
  const response = await axios.get(
    `https://api.redstone.finance/weather`,
    {
      params: { lat: latitude, lon: longitude },
      headers: { 'X-API-Key': process.env.REDSTONE_API_KEY }
    }
  );
  
  return {
    rainfall: response.data.rainfall,
    temperature: response.data.temperature,
    humidity: response.data.humidity
  };
}

async function checkPayoutTrigger(farmerId) {
  const farmer = await Farmer.findById(farmerId);
  const weather = await fetchWeatherData(
    farmer.location.lat, 
    farmer.location.lon
  );
  
  // Check drought threshold
  if (weather.rainfall < 50) {
    await triggerPayout(farmer.wallet, calculatePayout(farmer));
  }
}

module.exports = { fetchWeatherData, checkPayoutTrigger };
```

## 📦 Deployment Checklist

- [ ] Deploy smart contracts to Celo Alfajores testnet
- [ ] Verify contracts on Celoscan
- [ ] Deploy backend API (Render/Fly.io)
- [ ] Configure CORS for frontend
- [ ] Set up MongoDB/PostgreSQL database
- [ ] Configure RedStone oracle credentials
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Connect production environment variables
- [ ] Test end-to-end flows on testnet
- [ ] Deploy to Celo Mainnet

## 🚀 Current Frontend Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- The current UI uses **mock data** for demonstration
- Wallet connection is simulated - integrate real Web3 providers
- Weather data is static - connect to RedStone API via backend
- All blockchain interactions need ContractKit integration

## 🔐 Security Considerations

- Never commit private keys or sensitive API keys
- Use environment variables for all configuration
- Implement proper input validation on backend
- Add rate limiting to API endpoints
- Use HTTPS for all production deployments
- Implement proper RLS policies if using Supabase

---

**Built with:** React, TypeScript, Tailwind CSS, Shadcn UI  
**Blockchain:** Celo (Alfajores + Mainnet)  
**Oracles:** RedStone Weather Data Feeds  
