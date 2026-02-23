# 📁 Threvia Project Structure

```
threvia-app/
│
├── 📖 DOCUMENTATION (START HERE!)
│   ├── QUICKSTART.md ⭐              (30-minute setup guide)
│   ├── DOCS_INDEX.md                 (Documentation navigation)
│   ├── README.md                     (Project overview)
│   ├── COMPLETE_SETUP_GUIDE.md       (Detailed instructions)
│   ├── DEPLOYMENT_GUIDE.md           (Token + API deployment)
│   ├── SETUP_SUMMARY.md              (Architecture & summary)
│   └── TOKEN_INTEGRATION_GUIDE.md    (Token smart contract)
│
├── 🔐 FRONTEND (React + Vite)
│   ├── src/
│   │   ├── App.jsx                   (Main app component)
│   │   ├── Login.jsx                 (Email/Base authentication)
│   │   ├── Register.jsx              (User registration form)
│   │   ├── AdminDashboard.jsx        (Admin control panel)
│   │   ├── Auth.jsx                  (Base wallet integration)
│   │   ├── Payment.jsx               (Payment component)
│   │   ├── DataPurchase.jsx          (Token purchase interface)
│   │   ├── config/
│   │   │   └── api.js                (API client with auth)
│   │   ├── main.jsx                  (React entry point)
│   │   └── index.css                 (Styles)
│   ├── index.html                    (HTML entry)
│   ├── vite.config.js                (Vite configuration)
│   └── package.json                  (Frontend dependencies)
│
├── 🖥️ BACKEND API (Express + PostgreSQL)
│   └── backend/
│       ├── src/
│       │   ├── index.js              (Express server entry)
│       │   ├── config/
│       │   │   └── database.js       (PostgreSQL setup & schema)
│       │   ├── routes/
│       │   │   ├── auth.js           (Register/login endpoints)
│       │   │   ├── users.js          (User management)
│       │   │   ├── competitions.js   (Competition management)
│       │   │   └── token.js          (Token operations)
│       │   └── middleware/
│       │       └── auth.js           (JWT verification)
│       ├── package.json              (Backend dependencies)
│       ├── .env.example              (Environment template)
│       └── README.md                 (API documentation)
│
├── 🔗 SMART CONTRACTS (Solidity + Hardhat)
│   ├── contracts/
│   │   └── ThreviaToken.sol          (ERC-20 token contract)
│   ├── scripts/
│   │   ├── deploy.js                 (Deploy to Base Sepolia/Mainnet)
│   │   └── mint.js                   (Mint test tokens)
│   └── hardhat.config.js             (Hardhat configuration)
│
├── 🛠️ CONFIGURATION
│   ├── package.json                  (Frontend package.json)
│   ├── .gitignore                    (Git ignore file)
│   ├── .env                          (Environment variables - NOT in git)
│   └── setup.sh                      (Setup automation script)
│
└── 📁 GENERATED FOLDERS (Auto-created)
    ├── node_modules/                 (Frontend dependencies)
    ├── backend/node_modules/         (Backend dependencies)
    ├── artifacts/                    (Smart contract artifacts)
    ├── cache/                        (Hardhat cache)
    └── dist/                         (Production build)

```

## 📊 Component Relationships

```
User Browser
    ↓
Frontend (React)
    ├─ Login.jsx
    ├─ Register.jsx
    ├─ AdminDashboard.jsx
    ├─ DataPurchase.jsx
    └─ App.jsx
    ↓
src/config/api.js (API Client)
    ↓
Backend API (Express)
    ├─ /api/auth          (auth.js)
    ├─ /api/users         (users.js)
    ├─ /api/competitions  (competitions.js)
    └─ /api/token         (token.js)
    ↓
PostgreSQL Database
    ├─ users table
    ├─ competitions table
    └─ transactions table

Smart Contract (Solidity)
    ↓
Base Blockchain
    └─ ThreviaToken (THREV)
```

## 🔄 Data Flow

```
Registration/Login
├─ User submits form (Login.jsx)
├─ Validates input (Register.jsx)
├─ Sends POST to /api/auth/register or /api/auth/login
├─ Backend validates & hashes password (auth.js)
├─ Stores user in PostgreSQL (database.js)
├─ Returns JWT token & user data
└─ Frontend stores token in localStorage

Admin Operations
├─ Admin logs in with admin@threvia.app
├─ Backend detects admin email (users.js)
├─ Grants access to AdminDashboard.jsx
├─ Can manage users, competitions, award bucks
└─ All operations logged in transactions table

Token Purchase
├─ User clicks "Buy Data" (DataPurchase.jsx)
├─ Selects package & amount
├─ Submits to /api/token/purchase-data
├─ Backend deducts from bucks_balance (token.js)
├─ Logs transaction in database
└─ User receives data access
```

## 🎯 File Purpose Quick Reference

| File | Purpose | Tech |
|------|---------|------|
| App.jsx | Main app flow & auth | React |
| Login.jsx | Email/wallet login UI | React |
| Register.jsx | Registration form | React |
| AdminDashboard.jsx | Admin panel | React |
| DataPurchase.jsx | Token purchase UI | React |
| config/api.js | API client library | JavaScript |
| backend/index.js | Express server | Node.js |
| database.js | PostgreSQL setup | PostgreSQL |
| routes/auth.js | Auth endpoints | Express |
| routes/users.js | User CRUD | Express |
| routes/competitions.js | Competition CRUD | Express |
| routes/token.js | Token operations | Express |
| middleware/auth.js | JWT verification | Node.js |
| ThreviaToken.sol | ERC-20 contract | Solidity |
| deploy.js | Contract deployment | Hardhat |
| hardhat.config.js | Hardhat setup | JavaScript |

## 📦 Key Dependencies

### Frontend
```
react@18.2.0
@base-org/account
@base-org/account-ui
@farcaster/miniapp-sdk
```

### Backend
```
express@4.18.2
pg@8.11.3
bcryptjs@2.4.3
jsonwebtoken@9.1.2
cors@2.8.5
dotenv@16.3.1
```

### Smart Contracts
```
hardhat@2.20.1
@nomicfoundation/hardhat-ethers@3.0.5
@nomicfoundation/hardhat-toolbox@4.0.0
```

## 🚀 Environment Setup

### Root Directory (.env)
```
PRIVATE_KEY=wallet_private_key
BASESCAN_API_KEY=optional
```

### Backend Directory (backend/.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=long_random_string
PORT=5000
NODE_ENV=development
BASE_RPC_URL=https://sepolia.base.org
THREVIA_TOKEN_ADDRESS=0x...
```

## 📊 Database Schema Overview

### users table
```
id (PK) | name | email | phone | password_hash | wallet_address
bucks_balance | engagement_score | sessions_completed
login_method | created_at | updated_at
```

### competitions table
```
id (PK) | name | description | metric
start_date | end_date | prize_pool | status
created_at | updated_at
```

### transactions table
```
id (PK) | user_id (FK) | type | amount | description
tx_hash | created_at
```

## 🔐 Authentication Flow

```
User Registration
├─ POST /api/auth/register {name, email, phone, password}
├─ Backend: Check email unique
├─ Backend: Hash password with bcryptjs
├─ Backend: Store user in database
├─ Backend: Generate JWT token
└─ Return: {token, user}

User Login (Email)
├─ POST /api/auth/login {email, password}
├─ Backend: Find user by email
├─ Backend: Compare password hash
├─ Backend: Generate JWT token
└─ Return: {token, user}

User Login (Base Wallet)
├─ POST /api/auth/login-base {walletAddress, name}
├─ Backend: Find or create wallet user
├─ Backend: Auto-generate user if new
├─ Backend: Generate JWT token
└─ Return: {token, user}
```

## 🎯 API Endpoints Summary

### Authentication (auth.js)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Email login
- `POST /api/auth/login-base` - Wallet login

### Users (users.js)
- `GET /api/users` - All users (admin)
- `GET /api/users/me` - Current user
- `PUT /api/users/me` - Update profile
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/users/:id/add-bucks` - Award bucks (admin)
- `GET /api/users/leaderboard` - Top 10 users

### Competitions (competitions.js)
- `GET /api/competitions` - List all
- `POST /api/competitions` - Create (admin)
- `PUT /api/competitions/:id` - Update (admin)
- `DELETE /api/competitions/:id` - Delete (admin)

### Token (token.js)
- `GET /api/token/info` - Token metadata
- `GET /api/token/balance/:address` - User balance
- `POST /api/token/purchase-data` - Buy data package
- `POST /api/token/award/:userId` - Award bucks (admin)

---

**Ready?** Start with [QUICKSTART.md](./QUICKSTART.md) → [DOCS_INDEX.md](./DOCS_INDEX.md)
