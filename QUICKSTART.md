# 🎯 Quick Start Guide

Get your Threvia app with token + backend running in 30 minutes!

## ⚡ Fastest Path Forward

### 1️⃣ Start Backend (5 min)

```bash
# Install dependencies
cd backend
npm install

# Create .env
cp .env.example .env
# Edit .env - set DATABASE_URL and JWT_SECRET

# Start backend
npm run dev
```

✅ Backend running on http://localhost:5000

### 2️⃣ Start Frontend (2 min)

```bash
# In new terminal, from root directory
npm run dev
```

✅ Frontend running on http://localhost:5173

### 3️⃣ Set Up Database (5 min)

```bash
# Open another terminal
sudo -u postgres psql

# Paste these commands:
CREATE DATABASE threvia;
CREATE USER threvia_user WITH PASSWORD 'your_password';
ALTER ROLE threvia_user SET client_encoding TO 'utf8';
ALTER ROLE threvia_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;
\q
```

### 4️⃣ Deploy Token Contract (10 min)

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create .env in root with your private key:
echo "PRIVATE_KEY=your_wallet_private_key_here" > .env

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.cjs --network baseSepolia
```

✅ Token deployed! Copy address from output.

### 5️⃣ Update Backend Config (2 min)

```bash
# In backend/.env, add the token address from step 4:
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef...
```

## 🧪 Test the System

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Check Frontend
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in form
4. Should redirect to sponsor selection
5. Select sponsor and watch ad
6. Access main app modules

## 🔑 Admin Access

Register with email: `admin@threvia.app`

You'll automatically get access to:
- User management
- Leaderboard
- Competitions
- Award bucks to users

## 📂 Project Structure

```
threvia-app/
├── src/                      # React frontend
│   ├── App.jsx              # Main component
│   ├── Login.jsx            # Login page
│   ├── Register.jsx         # Registration
│   ├── AdminDashboard.jsx   # Admin panel
│   ├── DataPurchase.jsx     # Token purchase
│   └── config/
│       └── api.js           # API client
├── backend/                 # Express server
│   ├── src/
│   │   ├── index.js         # Server entry
│   │   ├── config/
│   │   │   └── database.js  # PostgreSQL
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── competitions.js
│   │   │   └── token.js
│   │   └── middleware/
│   │       └── auth.js      # JWT verification
│   └── package.json
├── contracts/
│   └── ThreviaToken.sol     # ERC-20 contract
├── scripts/
│   ├── deploy.js            # Deploy token
│   └── mint.js              # Mint tokens
├── package.json
└── hardhat.config.cjs        # Hardhat config
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check .env file has DATABASE_URL
cat backend/.env
```

### Token deployment fails
```bash
# Get ETH from faucet
# Visit: https://www.basefaucet.com

# Check private key is set
echo $PRIVATE_KEY

# Try again
npx hardhat run scripts/deploy.cjs --network baseSepolia
```

### Can't register user
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check database is created
psql -U threvia_user -d threvia -c "SELECT * FROM users;"
```

## 📚 Documentation

- **Detailed Setup**: See `COMPLETE_SETUP_GUIDE.md`
- **Token Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Backend API**: See `backend/README.md`

## 🚀 Next Steps

After everything is working:

1. [ ] Test all auth methods (email + Base wallet)
2. [ ] Test token minting and burning
3. [ ] Create competitions via admin dashboard
4. [ ] Deploy to Base mainnet (production)
5. [ ] Deploy backend to Railway/Render
6. [ ] Deploy frontend to Vercel
7. [ ] Set up email verification
8. [ ] Add password reset functionality

## 💡 Pro Tips

- Use `npm run dev` in both frontend and backend directories
- Keep three terminals open: frontend, backend, and hardhat commands
- Save your deployed contract address to a safe place
- Never commit your `.env` files to git
- Test thoroughly on Sepolia before mainnet deployment

---

**Need help?** Check the detailed guides or open an issue on GitHub.

Happy building! 🎉
