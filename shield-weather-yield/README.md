# WeatherShield - Parametric Crop Insurance DApp

![WeatherShield](https://img.shields.io/badge/Blockchain-Celo-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**WeatherShield** is a decentralized parametric crop insurance platform that provides automated payouts based on real-time weather data from RedStone oracles, deployed on the Celo blockchain.

## 🌟 Features

- **Automated Insurance** - No manual claims, payouts triggered by weather thresholds
- **Blockchain-Powered** - Transparent, trustless smart contracts on Celo
- **Real-Time Monitoring** - Live weather data from RedStone oracles
- **Instant Payouts** - Receive cUSD directly to your wallet
- **Easy Registration** - Connect wallet, add farm details, get covered

## 🏗️ Architecture

```
WeatherShield Frontend (This Repo)
├── Landing Page - Hero, features, stats
├── Registration - Wallet connect, farm details
└── Dashboard - Weather monitoring, claims

WeatherShield Contracts (External)
├── FarmerRegistry.sol
├── PremiumPool.sol
└── PayoutManager.sol

WeatherShield Backend (External)
├── REST API
├── Oracle Integration
└── Database
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd weathershield

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to view the app.

## 📱 Pages

### Landing Page (`/`)
- Hero section with farmer imagery
- Feature cards explaining the process
- Statistics and social proof
- Call-to-action buttons

### Registration (`/register`)
- Wallet connection (Valora/MetaMask)
- Crop type selection
- Farm location input
- Premium calculator
- Registration confirmation

### Dashboard (`/dashboard`)
- Farm details overview
- Live weather monitoring cards
- Rainfall, temperature, humidity, wind speed
- Claim history with payout details
- Coverage renewal options

## 🎨 Design System

**Color Palette:**
- Primary: Green (#10B981) - Trust, growth, agriculture
- Accent: Amber (#F59E0B) - Warmth, energy
- Background: White (#FFFFFF) - Clean, professional

**Typography:**
- Inter font family for readability
- Responsive sizing for mobile-first design

**Components:**
- Shadcn UI base components
- Custom variants for hero buttons
- Smooth transitions and hover effects

## 🔌 Integration

This frontend is ready to integrate with:

1. **Smart Contracts** - Deploy Solidity contracts on Celo
2. **Backend API** - Node.js/Express server for oracle integration
3. **Database** - MongoDB/PostgreSQL for off-chain data
4. **Wallet Providers** - @celo/contractkit for Web3 interactions

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed instructions.

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Routing:** React Router v6
- **Icons:** Lucide React
- **State Management:** TanStack Query

## 📦 Project Structure

```
src/
├── assets/           # Images and static files
├── components/
│   └── ui/          # Shadcn UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Route components
│   ├── Landing.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── App.tsx          # Main app component
├── index.css        # Global styles + design tokens
└── main.tsx         # Entry point
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build production bundle
npm run build

# Preview build
npm run preview
```

Deploy the `dist/` folder to Vercel or Netlify.

### Environment Variables

Create `.env` file:

```env
VITE_BACKEND_API_URL=https://api.weathershield.com
VITE_FARMER_REGISTRY_ADDRESS=0x...
VITE_PREMIUM_POOL_ADDRESS=0x...
VITE_PAYOUT_MANAGER_ADDRESS=0x...
VITE_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📞 Support

- **Documentation:** [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Issues:** GitHub Issues
- **Celo Docs:** https://docs.celo.org
- **RedStone Docs:** https://docs.redstone.finance

## 🎯 Roadmap

- [x] Frontend UI/UX design
- [x] Landing page
- [x] Registration flow
- [x] Farmer dashboard
- [ ] Smart contract integration
- [ ] Backend API connection
- [ ] Oracle data feeds
- [ ] DAO governance module
- [ ] Mobile app (React Native)
- [ ] Multilingual support

---

**Built with ❤️ for farmers worldwide**

Powered by Celo 🌱 | Oracle data by RedStone 🔴
