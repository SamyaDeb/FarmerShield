# WeatherShield 🌾

A production-ready parametric crop insurance dApp built on the Celo blockchain with RedStone oracle integration for real-time weather data.

## 🌟 Features

- **Blockchain-Powered Insurance**: Smart contracts on Celo for transparent, automated payouts
- **Real-Time Weather Monitoring**: RedStone oracle integration for accurate weather data
- **Parametric Insurance**: Automated payouts based on weather thresholds
- **Modern UI/UX**: Beautiful, responsive interface with animations
- **Mobile-First Design**: Optimized for farmers on mobile devices
- **Secure Authentication**: Wallet-based authentication with JWT tokens
- **Comprehensive Dashboard**: Real-time weather data, claims history, and analytics

## 🏗️ Architecture

### Smart Contracts (Solidity + Hardhat)
- **FarmerRegistry.sol**: Manages farmer registration and location data
- **PremiumPool.sol**: Handles premium payments in cUSD
- **PayoutManager.sol**: Triggers automated payouts based on weather conditions

### Backend (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- MongoDB for farmer profiles, claims, and weather data
- RedStone oracle integration for weather data
- Real-time WebSocket support
- Comprehensive error handling and logging

### Frontend (React + TypeScript + Tailwind CSS)
- Modern React 18 with TypeScript
- Framer Motion for smooth animations
- Responsive design with Tailwind CSS
- Real-time weather widgets
- Interactive maps for farm location selection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/SamyaDeb/FarmerShield.git
cd FarmerShield
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
# Backend environment
cp backend/env.example backend/.env

# Frontend environment
cp shield-weather-yield/.env.example shield-weather-yield/.env.local

# Production environment
cp env.production.example env.production
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../shield-weather-yield
npm install

# Smart contracts dependencies
cd ../weathershield-contracts
npm install
```

### 4. Deploy Smart Contracts

```bash
cd weathershield-contracts

# Configure your private key in .env
# Deploy to Celo Alfajores
npx hardhat run scripts/deploy.ts --network alfajores
```

### 5. Start Development Servers

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from shield-weather-yield directory)
npm run dev
```

## 🐳 Production Deployment

### Using Docker Compose

1. **Configure Production Environment**:
   ```bash
   cp env.production.example env.production
   # Edit env.production with your production values
   ```

2. **Deploy with Docker**:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

3. **Access Your Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Manual Deployment

1. **Backend Deployment**:
   ```bash
   cd backend
   npm install --production
   npm start
   ```

2. **Frontend Deployment**:
   ```bash
   cd shield-weather-yield
   npm run build
   # Deploy dist/ folder to your hosting provider
   ```

## 📊 Smart Contract Addresses (Celo Alfajores)

- **FarmerRegistry**: `0x805dE0a2FC7e4818D19366f7191B162cB84dE89a`
- **PremiumPool**: `0xbfA80344cD3f706C80EF9924560E87E422507867`
- **PayoutManager**: `0x43A839630a3dB74dE461628bb5A665A22D4f8b90`
- **cUSD Token**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/weathershield
JWT_SECRET=your-jwt-secret
CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
REDSTONE_API_KEY=your-redstone-api-key
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
VITE_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
VITE_FARMER_REGISTRY_ADDRESS=0x805dE0a2FC7e4818D19366f7191B162cB84dE89a
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd shield-weather-yield
npm test
```

### Smart Contract Tests
```bash
cd weathershield-contracts
npx hardhat test
```

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new farmer
- `POST /api/auth/login` - Login with wallet signature
- `GET /api/auth/me` - Get current farmer profile

### Farmer Endpoints
- `GET /api/farmers/profile` - Get farmer profile
- `PUT /api/farmers/profile` - Update farmer profile
- `POST /api/farmers/register-insurance` - Register for insurance

### Weather Endpoints
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/history` - Get weather history
- `GET /api/weather/forecast` - Get weather forecast

### Claims Endpoints
- `GET /api/claims` - Get farmer's claims
- `GET /api/claims/:id` - Get specific claim
- `POST /api/claims/:id/evidence` - Add evidence to claim

## 🔒 Security Features

- JWT-based authentication
- Wallet signature verification
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Security headers
- SQL injection prevention (MongoDB)

## 🌐 Supported Networks

- **Celo Alfajores** (Testnet) - Primary development network
- **Celo Mainnet** - Production network (when ready)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Celo](https://celo.org/) - Blockchain platform
- [RedStone](https://redstone.finance/) - Oracle network
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For support, email support@weathershield.com or join our Discord community.

## 🗺️ Roadmap

- [ ] Multi-crop support
- [ ] Advanced weather analytics
- [ ] Mobile app (React Native)
- [ ] Integration with more oracle providers
- [ ] DAO governance features
- [ ] Cross-chain support
- [ ] Machine learning for risk assessment

---

**Built with ❤️ for farmers worldwide**