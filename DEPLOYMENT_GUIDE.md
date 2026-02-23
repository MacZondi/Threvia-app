# Threvia Token Deployment & Backend Setup Guide

## Part 1: Deploy ThreviaToken to Base Blockchain

### Step 1: Set Up Hardhat Environment

```bash
# Install Hardhat and plugins
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers

# Initialize Hardhat project (choose "Create an empty hardhat.config.js")
npx hardhat
```

### Step 2: Configure Hardhat for Base

Create or update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    baseSepolia: {
      url: `https://sepolia.base.org`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
    },
    baseMainnet: {
      url: `https://mainnet.base.org`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      baseMainnet: process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};
```

### Step 3: Create .env File

```bash
# Copy your contract file
mkdir -p contracts
cp contracts/ThreviaToken.sol contracts/ThreviaToken.sol

# Create .env file with:
# PRIVATE_KEY=your_wallet_private_key_here
# BASESCAN_API_KEY=your_basescan_api_key_here
```

**To get your private key:**
1. If using MetaMask: Settings → Account Details → Export Private Key
2. If using another wallet, follow wallet-specific instructions
3. **NEVER share your private key or commit it to git!**

**To get BaseScan API key:**
1. Go to https://basescan.org
2. Sign up or login
3. Go to API Keys
4. Create a new API key

### Step 4: Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying ThreviaToken...");

  const ThreviaToken = await hre.ethers.getContractFactory("ThreviaToken");
  const token = await ThreviaToken.deploy();

  await token.deployed();

  console.log("✅ ThreviaToken deployed to:", token.address);
  console.log("\n📋 Save this address in your frontend config!");
  console.log("Network: Base Sepolia (Testnet)");
  console.log("Contract Address:", token.address);
  console.log("Symbol: THREV");
  console.log("Decimals: 18");

  // Wait for confirmations before verifying
  console.log("\n⏳ Waiting for block confirmations...");
  await token.deployTransaction.wait(6);

  // Verify on BaseScan
  try {
    console.log("\n🔍 Verifying contract on BaseScan...");
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on BaseScan!");
  } catch (error) {
    console.log("ℹ️ Contract verification skipped or failed (can verify manually)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 5: Deploy to Base Sepolia (Testnet)

```bash
# Install dotenv
npm install dotenv

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network baseSepolia
```

**Expected Output:**
```
✅ ThreviaToken deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

### Step 6: Mint Test Tokens (Optional)

Create `scripts/mint.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Replace with your deployed address
  const [deployer] = await hre.ethers.getSigners();

  const ThreviaToken = await hre.ethers.getContractFactory("ThreviaToken");
  const token = ThreviaToken.attach(tokenAddress);

  // Mint 1,000,000 tokens (18 decimals)
  const amount = hre.ethers.parseEther("1000000");
  const tx = await token.mint(deployer.address, amount);
  await tx.wait();

  console.log("✅ Minted 1,000,000 THREV to", deployer.address);
  const balance = await token.balanceOf(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "THREV");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 7: Move to Base Mainnet (Production)

Once tested on Sepolia, deploy to mainnet:

```bash
# Make sure you have ETH for gas fees on Base mainnet
npx hardhat run scripts/deploy.js --network baseMainnet
```

---

## Part 2: Set Up Backend API

### Step 1: Create Backend Directory

```bash
mkdir threvia-backend
cd threvia-backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express cors dotenv pg bcryptjs jsonwebtoken axios
npm install --save-dev nodemon
```

### Step 3: Create .env File

```
DATABASE_URL=postgresql://user:password@localhost:5432/threvia
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
PORT=5000
NODE_ENV=development
BASE_RPC_URL=https://sepolia.base.org
THREVIA_TOKEN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
THREVIA_TOKEN_ABI=[{"inputs":[],"name":"constructor",...}]
```

### Step 4: Create Directory Structure

```bash
mkdir -p src/{routes,controllers,models,middleware,config}
touch src/index.js src/config/database.js src/middleware/auth.js
```

### Step 5: Database Setup

See next section for PostgreSQL setup...

---

## Part 3: PostgreSQL Database Setup

### Installation (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database

```bash
sudo -u postgres psql
CREATE DATABASE threvia;
CREATE USER threvia_user WITH PASSWORD 'secure_password_here';
ALTER ROLE threvia_user SET client_encoding TO 'utf8';
ALTER ROLE threvia_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE threvia_user SET default_transaction_deferrable TO on;
ALTER ROLE threvia_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE threvia TO threvia_user;
\q
```

### Create Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(255),
  bucks_balance DECIMAL(18, 0) DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competitions table
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric VARCHAR(50),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  prize_pool DECIMAL(18, 0),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50),
  amount DECIMAL(18, 0),
  description TEXT,
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_transactions_user ON transactions(user_id);
```

---

## Next Steps

1. ✅ Deploy token to Base Sepolia
2. ✅ Set up PostgreSQL database
3. ✅ Create Express backend (see Backend API Setup below)
4. ✅ Migrate frontend to use backend API
5. ✅ Deploy to Base Mainnet when production-ready

