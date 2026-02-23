# 🏥 Threvia Intelligence Engine

A Web3-native health & wellness platform built on Base blockchain for South African youth. Earn Threvia Bucks (THREV tokens), compete in challenges, and purchase data packages.

## ✨ Features

### 🔐 Authentication
- **Email/Password Login** with secure bcrypt hashing
- **Sign in with Base Wallet** (SIWE - Sign In With Ethereum)
- **User Registration** with validation
- Persistent sessions with JWT tokens

### 💰 Token Economy
- **Threvia Bucks (THREV)** ERC-20 token on Base blockchain
- Earn tokens through app engagement
- Purchase data packages with tokens or USDC
- Admin token distribution

### � Admin Dashboard
- User management (view, search, delete, award bucks)
- Leaderboard (top 10 users by engagement)
- Competition management (create, edit, delete)
- User statistics and analytics

### 🎮 Main App Modules
1. **Health Tracker** - Log health metrics
2. **Sleep Tracking** - Monitor sleep quality
3. **Step Counter** - Track daily steps
4. **Heart Rate Monitor** - Heart health tracking
5. **Water Intake** - Hydration tracking
6. **Nutrition Logger** - Food and nutrition tracking
7. **Watch Ads** - Earn bucks by watching ads
8. **Buy Data** - Purchase data packages with tokens

## 🚀 Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for a 30-minute setup guide.

```bash
# 1. Install dependencies
npm install

# 2. Start frontend
npm run dev

# 3. Start backend
cd backend && npm install && npm run dev

# 4. Deploy token
npm run deploy:token
```

## 📁 Project Structure

```
threvia-app/
├── src/                      # React frontend
├── backend/                  # Express API
├── contracts/                # Solidity smart contracts
├── scripts/                  # Deployment scripts
├── QUICKSTART.md            # 30-minute setup
├── COMPLETE_SETUP_GUIDE.md  # Full deployment guide
└── README.md                # This file
```

## 🔐 Authentication

### Email/Password
- Register with name, email, phone, password
- Login with email and password
- Secure bcrypt hashing

### Base Wallet
- Sign in with Ethereum (SIWE)
- Auto-create wallet user on first login
- No password needed

### Admin Access
Register/login with email `admin@threvia.app` to access admin dashboard.

## 💰 Token Economy

**ThreviaToken (THREV)** - ERC-20 on Base Blockchain

Deploy to testnet:
```bash
npm run deploy:token
```

Deploy to mainnet:
```bash
npm run deploy:token:mainnet
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Email login
- `POST /api/auth/login-base` - Wallet login

### Users
- `GET /api/users` - All users (admin)
- `GET /api/users/me` - Current user
- `GET /api/users/leaderboard` - Top 10

### Competitions
- `GET /api/competitions` - List all
- `POST /api/competitions` - Create (admin)

### Token
- `GET /api/token/info` - Token details
- `POST /api/token/purchase-data` - Buy data

See [backend/README.md](./backend/README.md) for full API documentation.

## 🧪 Testing

### Register and Login
1. Go to http://localhost:5173
2. Register with email/password
3. Login to access main app

### Admin Dashboard
1. Register with `admin@threvia.app`
2. Access admin panel to manage users/competitions

### Token Purchase
1. Go to "Buy Data" module
2. Purchase data package with tokens

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup (30 min)
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Full guide
- **[backend/README.md](./backend/README.md)** - API docs

## 🔧 Tech Stack

**Frontend**
- React 18
- Vite 5
- Base Account SDK
- Farcaster Mini App SDK

**Backend**
- Express.js
- PostgreSQL
- JWT authentication
- bcryptjs for passwords

**Smart Contracts**
- Solidity 0.8.19
- ERC-20 token standard
- Base blockchain

## 🚀 Deployment

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for production deployment to Railway, Render, or DigitalOcean.

## 📄 License

MIT License

## 🙏 Acknowledgments

Built with React, Express, PostgreSQL, and Solidity on Base blockchain.

Bash

npm run preview
🏗️ Project Structure
src/App.jsx: The primary application logic, containing session timers and sponsor management.

src/main.jsx: The application entry point.

threvia.jsx: Core component logic for the Threvia experience.

vite.config.js: Configuration for the Vite build tool.

🤝 Sponsors
The engine currently supports integration with various sectors including:

Telecommunications: (e.g., Vodacom)

Finance: (e.g., Standard Bank)

Retail/Health: (e.g., Clicks)