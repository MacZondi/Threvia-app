# 🚀 Complete Deployment Guide: Token + Backend API

This guide walks you through deploying the ThreviaToken to Base blockchain and setting up your backend API.

## 📋 Table of Contents

1. [Token Deployment](#token-deployment)
2. [Backend Setup](#backend-setup)
3. [Frontend Migration](#frontend-migration)
4. [Testing](#testing)

---

## 🔗 Token Deployment

### Prerequisites

- MetaMask or another wallet with ETH on Base Sepolia testnet
- [Hardhat](https://hardhat.org/) (will be installed below)

### Step 1: Get ETH for Gas Fees

1. Go to [Base Faucet](https://www.basefaucet.com)
2. Enter your wallet address
3. Click "Claim" (you should receive 0.05 ETH)

### Step 2: Install Hardhat

```bash
cd /home/nhlanhlamacdonald/Threvia-app

npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers
```

### Step 3: Configure Environment

```bash
# Create .env file in root (if not exists)
cat > .env << 'EOF'
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_optional
EOF
```

**To get your private key:**
- MetaMask: Settings → Account Details → Export Private Key
- **NEVER commit .env to git!**

### Step 4: Deploy Contract

```bash
# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.cjs --network baseSepolia
```

**Expected Output:**
```
✅ ThreviaToken deployed successfully!
📋 Save this information:

   Contract Address: 0x1234567890abcdef1234567890abcdef12345678
   Network: Base Sepolia (Testnet)
   Symbol: THREV
   Decimals: 18

🎉 Update your backend .env with:
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### Step 5: Mint Test Tokens (Optional)

```bash
npx hardhat run scripts/mint.cjs --network baseSepolia 0x1234567890abcdef1234567890abcdef12345678 1000000
```

This mints 1,000,000 THREV tokens to your wallet.

### Step 6: Verify Contract (Optional)

1. Go to https://sepolia.basescan.org
2. Search for your contract address
3. Click "Verify and Publish" → "Solidity (Single File)"
4. Copy contents of `contracts/ThreviaToken.sol`
5. Compiler version: 0.8.19
6. License: MIT

---

## 🖥️ Backend API Setup

### Step 1: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Step 2: Create Database

```bash
sudo -u postgres psql
```

Then in the PostgreSQL prompt:
```sql
CREATE DATABASE threvia;
CREATE USER threvia_user WITH PASSWORD 'your_secure_password_here';

ALTER ROLE threvia_user SET client_encoding TO 'utf8';
ALTER ROLE threvia_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE threvia_user SET default_transaction_deferrable TO on;
ALTER ROLE threvia_user SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;

\q
```

### Step 3: Configure Backend

```bash
cd backend

# Copy example env
cp .env.example .env

# Edit .env with your values
nano .env
```

Update with your actual values:
```
DATABASE_URL=postgresql://threvia_user:your_secure_password_here@localhost:5432/threvia
JWT_SECRET=generate_a_random_long_string_here
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✅ Threvia API running on port 5000
🌐 http://localhost:5000
```

### Step 6: Test Backend

Open another terminal:

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎨 Frontend Migration

### Step 1: Update API Base URL

Create `src/config/api.js`:

```javascript
export const API_BASE_URL = 'http://localhost:5000/api';

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }

  return response.json();
}
```

### Step 2: Update Login Component

Update `src/Login.jsx` to use backend:

```javascript
import { apiCall } from './config/api';

// In handleEmailLogin function:
const response = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

localStorage.setItem('authToken', response.token);
setUser(response.user);
onLoginSuccess(response.user);
```

### Step 3: Update Register Component

Similar changes in `src/Register.jsx`:

```javascript
const response = await apiCall('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, phone, password }),
});

localStorage.setItem('authToken', response.token);
onSuccess();
```

### Step 4: Update Admin Dashboard

Update `src/AdminDashboard.jsx` to fetch from backend:

```javascript
useEffect(() => {
  apiCall('/users')
    .then(data => setUsers(data.users))
    .catch(error => console.error('Failed to fetch users:', error));
}, []);
```

---

## ✅ Testing

### 1. Full Registration Flow

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
npm run dev

# Browser: Go to http://localhost:5173
# 1. Click "Register"
# 2. Fill in details
# 3. Submit
# 4. Check PostgreSQL: SELECT * FROM users;
```

### 2. Admin Access

```bash
# Register/login with email ending in @threvia.app
# Example: admin@threvia.app
# Should see "Admin Dashboard" option
```

### 3. Data Purchase

```bash
# In main app → Buy Data module
# Try to purchase with insufficient bucks (should fail)
# Admin adds bucks via dashboard
# Retry purchase (should succeed)
# Check transaction: SELECT * FROM transactions;
```

### 4. Competitions

```bash
# Via API or admin dashboard
# Create competition
# Check database: SELECT * FROM competitions;
```

---

## 🚀 Production Deployment

### Token (Mainnet)

```bash
# After testing on Sepolia, deploy to mainnet:
npx hardhat run scripts/deploy.cjs --network baseMainnet
```

### Backend

Options:
- **Railway**: https://railway.app (PostgreSQL + Node)
- **Render**: https://render.com (Free tier available)
- **DigitalOcean**: https://digitalocean.com
- **AWS**: Lambda + RDS

Example Railway deployment:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Frontend

```bash
# Update API_BASE_URL in src/config/api.js to production URL
# Build
npm run build

# Deploy to Vercel/Netlify
npm install -g vercel
vercel
```

---

## 📞 Support

If you run into issues:

1. Check that PostgreSQL is running: `sudo systemctl status postgresql`
2. Check that backend is running: `http://localhost:5000/api/health`
3. Check frontend console for errors (F12)
4. Check network tab for API response codes

---

## 🎉 Next Steps

After deployment:
- [ ] Test full user flow
- [ ] Test admin functions
- [ ] Test token minting/burning
- [ ] Set up email verification
- [ ] Add password reset
- [ ] Deploy to production

