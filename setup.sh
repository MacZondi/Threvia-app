#!/bin/bash
# Threvia Complete Setup Script
# Copy and paste these commands one at a time

echo "🚀 Threvia Complete Setup Guide"
echo "================================"
echo ""

# STEP 1: Set Up PostgreSQL
echo "STEP 1: Create PostgreSQL Database"
echo "===================================="
echo ""
echo "Run these commands:"
echo "sudo -u postgres psql"
echo ""
echo "Then in the PostgreSQL prompt, paste:"
echo "CREATE DATABASE threvia;"
echo "CREATE USER threvia_user WITH PASSWORD 'secure_password_here';"
echo "ALTER ROLE threvia_user SET client_encoding TO 'utf8';"
echo "ALTER ROLE threvia_user SET default_transaction_isolation TO 'read committed';"
echo "GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;"
echo "\q"
echo ""
echo "Press ENTER after completing..."
read

# STEP 2: Backend Setup
echo "STEP 2: Set Up Backend"
echo "====================="
echo ""
echo "Running: cd backend && npm install"
cd backend
npm install
echo ""
echo "Creating .env file..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://threvia_user:secure_password_here@localhost:5432/threvia
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random_here
PORT=5000
NODE_ENV=development
BASE_RPC_URL=https://sepolia.base.org
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
EOF

echo "✅ Backend .env created!"
echo "⚠️  Update DATABASE_URL with your actual password from Step 1"
echo ""
echo "Run in this terminal:"
echo "npm run dev"
echo ""
echo "Press ENTER after starting backend..."
read

# STEP 3: Frontend Setup (new terminal)
echo "STEP 3: Set Up Frontend"
echo "======================"
echo ""
echo "In a NEW terminal, run:"
echo "cd /home/nhlanhlamacdonald/Threvia-app"
echo "npm run dev"
echo ""
echo "Your frontend will run on http://localhost:5173"
echo ""
echo "Press ENTER when frontend is running..."
read

# STEP 4: Hardhat Setup
echo "STEP 4: Install Hardhat for Token Deployment"
echo "============================================="
echo ""
echo "In root directory (/home/nhlanhlamacdonald/Threvia-app):"
echo ""
echo "npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox"
echo ""
echo "Creating .env for Hardhat..."
cat > .env << 'EOF'
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=optional_for_verification
EOF

echo "✅ Hardhat .env created!"
echo "⚠️  Get private key from MetaMask: Settings → Account Details → Export"
echo "⚠️  Get ETH from https://www.basefaucet.com"
echo ""
echo "Press ENTER when ready..."
read

# STEP 5: Deploy Token
echo "STEP 5: Deploy Token Contract"
echo "============================="
echo ""
echo "Run:"
echo "npm run deploy:token"
echo ""
echo "This will:"
echo "✅ Deploy ThreviaToken to Base Sepolia"
echo "✅ Display contract address"
echo "✅ Output ready to copy to backend .env"
echo ""
echo "Press ENTER when deployment completes..."
read

# STEP 6: Test Backend
echo "STEP 6: Test Backend API"
echo "======================="
echo ""
echo "In a new terminal, run:"
echo ""
echo "# Test registration"
echo "curl -X POST http://localhost:5000/api/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"phone\":\"+1234567890\",\"password\":\"password123\"}'"
echo ""
echo "# Test login"
echo "curl -X POST http://localhost:5000/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo ""
echo "Press ENTER when done testing..."
read

# STEP 7: Test Frontend
echo "STEP 7: Test Frontend"
echo "===================="
echo ""
echo "In browser, go to:"
echo "http://localhost:5173"
echo ""
echo "✅ Try registering a new user"
echo "✅ Try logging in"
echo "✅ Try accessing app modules"
echo ""
echo "For admin dashboard, register with:"
echo "admin@threvia.app"
echo ""
echo "Press ENTER to continue..."
read

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Threvia app is now running with:"
echo "✅ Frontend: http://localhost:5173"
echo "✅ Backend: http://localhost:5000"
echo "✅ Database: PostgreSQL (threvia)"
echo "✅ Token: Deployed to Base Sepolia"
echo ""
echo "Next steps:"
echo "1. Test all features"
echo "2. Read QUICKSTART.md for more info"
echo "3. Read COMPLETE_SETUP_GUIDE.md for production"
echo ""
echo "Happy building! 🚀"
