# ✅ Threvia Setup Checklist

Use this checklist to track your progress through the setup process.

## 📖 Reading Documentation
- [ ] Read QUICKSTART.md
- [ ] Read DOCS_INDEX.md for navigation
- [ ] Skim PROJECT_STRUCTURE.md to understand architecture
- [ ] (Optional) Read COMPLETE_SETUP_GUIDE.md for detailed info

## 🗄️ Database Setup
- [ ] Install PostgreSQL
  - Ubuntu: `sudo apt install postgresql postgresql-contrib`
  - macOS: `brew install postgresql`
- [ ] Start PostgreSQL service
  - Ubuntu: `sudo systemctl start postgresql`
  - macOS: `brew services start postgresql`
- [ ] Create database: `sudo -u postgres psql`
  - Run: `CREATE DATABASE threvia;`
  - Run: `CREATE USER threvia_user WITH PASSWORD 'your_password';`
  - Run: `ALTER ROLE threvia_user SET client_encoding TO 'utf8';`
  - Run: `GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;`
  - Run: `\q` to exit
- [ ] Verify database connection: `psql -U threvia_user -d threvia -c "SELECT 1;"`

## 🖥️ Backend Setup
- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy env template: `cp .env.example .env`
- [ ] Edit .env file with your database password
  - Update: `DATABASE_URL=postgresql://threvia_user:YOUR_PASSWORD@localhost:5432/threvia`
  - Update: `JWT_SECRET=your_super_secret_key_here` (random long string)
  - Keep: `PORT=5000`
- [ ] Start backend: `npm run dev`
- [ ] Verify backend running:
  - Should see: `✅ Threvia API running on port 5000`
  - Test: `curl http://localhost:5000/api/health`

## 💻 Frontend Setup
- [ ] Open new terminal
- [ ] Navigate to root directory: `cd /home/nhlanhlamacdonald/Threvia-app`
- [ ] Install dependencies (if not already done): `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Verify frontend running:
  - Should see: `VITE v5.x.x`
  - URL should be: `http://localhost:5173`
- [ ] Open browser: `http://localhost:5173`

## 🔗 Smart Contract Setup
- [ ] Install Hardhat dependencies: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`
- [ ] Create .env file in root (if not exists)
  - Add: `PRIVATE_KEY=your_wallet_private_key_here`
  - Add: `BASESCAN_API_KEY=optional_for_verification`
- [ ] Get test ETH:
  - Go to: https://www.basefaucet.com
  - Enter your wallet address
  - Click "Claim" (takes a few minutes)
- [ ] Verify you have ETH: Check MetaMask Balance in Base Sepolia network

## 🚀 Token Deployment
- [ ] Deploy contract: `npm run deploy:token`
- [ ] Wait for deployment to complete
- [ ] Save contract address from output
- [ ] Update backend .env:
  - Add: `THREVIA_TOKEN_ADDRESS=0x...` (from deployment output)
- [ ] Restart backend to load new config
- [ ] (Optional) Mint test tokens: `npm run mint:tokens 0x... 1000000`

## 🧪 Testing Registration
- [ ] In browser at http://localhost:5173
- [ ] Click "Register"
- [ ] Fill in form:
  - Name: Test User
  - Email: test@example.com
  - Phone: +1234567890
  - Password: password123
- [ ] Click "Register"
- [ ] Should redirect to sponsor selection
- [ ] Should see success message

## 🧪 Testing Login
- [ ] In browser at http://localhost:5173
- [ ] Click "Login"
- [ ] Enter credentials:
  - Email: test@example.com
  - Password: password123
- [ ] Click "Login"
- [ ] Should redirect to sponsor selection
- [ ] Bucks display should show "0"

## 🧪 Testing Admin Dashboard
- [ ] Register new user with email: `admin@threvia.app`
- [ ] Login with that email
- [ ] Should see "Admin Dashboard" option
- [ ] Click it to access:
  - [ ] Users tab (should see all users)
  - [ ] Leaderboard tab (should see users ranked)
  - [ ] Competitions tab (should see sample competitions)
- [ ] Try admin functions:
  - [ ] Search for a user
  - [ ] Award bucks to a user
  - [ ] Create a competition
  - [ ] Edit a competition

## 🧪 Testing Token Purchase
- [ ] Login as regular user (test@example.com)
- [ ] Go to "Buy Data" module
- [ ] Try to purchase data:
  - Should see error: "Insufficient bucks"
- [ ] Go back to app
- [ ] Login as admin (admin@threvia.app)
- [ ] Award 1000 bucks to the user
- [ ] Logout and login as regular user again
- [ ] Try to purchase data again:
  - Should succeed
  - Bucks should decrease
  - Should see transaction confirmation

## 🧪 Testing Base Wallet Auth
- [ ] In MetaMask, get your wallet address (Base Sepolia network)
- [ ] In browser at http://localhost:5173
- [ ] Click "Login"
- [ ] Click "Sign in with Base"
- [ ] Follow MetaMask prompt
- [ ] Should login successfully
- [ ] Should see app without password

## 🔍 API Testing (Optional)
- [ ] Open new terminal
- [ ] Test registration via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"api@test.com","phone":"+1234567890","password":"test123"}'
```
- [ ] Should get back token and user data
- [ ] Test login via API:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123"}'
```
- [ ] Should get back token and user data

## 📊 Database Verification (Optional)
- [ ] Open terminal
- [ ] Connect to database: `psql -U threvia_user -d threvia`
- [ ] Check users table: `SELECT id, name, email FROM users;`
- [ ] Should see registered users
- [ ] Check competitions: `SELECT id, name FROM competitions;`
- [ ] Check transactions: `SELECT * FROM transactions;`
- [ ] Exit: `\q`

## ✅ Final Verification
- [ ] Frontend is running at http://localhost:5173
- [ ] Backend is running at http://localhost:5000
- [ ] Database is connected and populated
- [ ] Can register users
- [ ] Can login with email/password
- [ ] Can login with Base wallet
- [ ] Admin dashboard works
- [ ] Can award tokens
- [ ] Can purchase data
- [ ] Token is deployed on Base Sepolia

## 📚 Next Steps
- [ ] Read COMPLETE_SETUP_GUIDE.md if you want more details
- [ ] Read backend/README.md for API documentation
- [ ] Review PROJECT_STRUCTURE.md to understand code organization
- [ ] When ready: Deploy token to Base mainnet
- [ ] When ready: Deploy backend to production
- [ ] When ready: Deploy frontend to Vercel/Netlify

## 🆘 Troubleshooting
If something doesn't work:
1. Check the relevant documentation troubleshooting section
2. Verify all processes are running (frontend, backend, database)
3. Check .env files have correct values
4. Review error messages in terminal/console (F12)
5. Restart the affected service

---

**Estimated Total Time: 1-2 hours for first-time setup**

Once everything is checked off, you have a fully functional Threvia system! 🎉
