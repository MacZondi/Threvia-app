# Threvia Token (THREV) - Implementation Guide

## Token Specifications

### Basic Info
- **Name**: Threvia Bucks
- **Symbol**: THREV
- **Standard**: ERC-20 (Ethereum-compatible)
- **Decimals**: 18
- **Network**: Base (Layer 2 of Ethereum)
  - Testnet: Base Sepolia
  - Mainnet: Base Mainnet
- **Chain ID**: 84532 (Sepolia) / 8453 (Mainnet)

---

## Economics

### Supply Model
```
Initial Mint: 1,000,000 THREV (1M tokens)
├── 400,000 → Minting mechanism (earned by users)
├── 300,000 → Sponsor partnerships
├── 200,000 → Team allocation (vested)
├── 75,000 → Liquidity pool
└── 25,000 → Reserve
```

### Points → THREV Conversion
```
100 Points = 1 THREV

Earning Rates:
├── Watch 30s ad = 50 points
├── Health log = 10 points
├── Educational quiz = 25 points
├── Referral = 500 points (1st friend)
├── Daily streak = 20 points (per day)
└── Survey completion = 15 points

Examples:
- 5 ads/day = 250 points = 2.5 THREV/day
- 7 days active = 140 points = 1.4 THREV/week
- 100 points = 1 day of premium access
```

---

## Smart Contract

### Updated ThreviaToken.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ThreviaToken
 * @dev ERC-20 Token for Threvia Intelligence Engine
 * Points conversion & user minting enabled
 * Deployed on Base network
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ThreviaToken is IERC20 {
    string public constant name = "Threvia Bucks";
    string public constant symbol = "THREV";
    uint8 public constant decimals = 18;
    
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    mapping(address => bool) public minters;
    
    // Conversion tracking
    mapping(address => uint256) public userPointsConverted;
    uint256 public totalPointsConverted;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event PointsConverted(address indexed user, uint256 points, uint256 threvAmount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Only minters");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        minters[msg.sender] = true;
        
        // Initial mint to owner
        _mint(msg.sender, 1000000 * 10**decimals);
    }
    
    /**
     * @dev Mint tokens to user from points
     * Backend calls this when user converts points
     */
    function convertPointsToThrev(
        address user,
        uint256 points,
        uint256 threvAmount
    ) external onlyMinter {
        require(user != address(0), "Invalid user");
        require(points > 0 && threvAmount > 0, "Invalid amounts");
        
        // Track conversion
        userPointsConverted[user] += points;
        totalPointsConverted += points;
        
        // Mint THREV to user
        _mint(user, threvAmount * 10**decimals);
        
        emit PointsConverted(user, points, threvAmount);
    }
    
    /**
     * @dev Internal mint function
     */
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be > 0");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit Minted(to, amount);
    }
    
    /**
     * @dev Standard ERC20 transfer
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Standard ERC20 approve
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Standard ERC20 transferFrom
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(from != address(0), "Invalid sender");
        require(to != address(0), "Invalid recipient");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Burn tokens from user balance
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
        emit Burned(msg.sender, amount);
    }
    
    /**
     * @dev Admin: Add minter address
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Admin: Remove minter address
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Get user's conversion history
     */
    function getConversionHistory(address user) external view returns (uint256) {
        return userPointsConverted[user];
    }
}
```

---

## Deployment Process

### Step 1: Setup Environment

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers dotenv

# Create .env file
DEPLOYER_PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### Step 2: Hardhat Configuration

**hardhat.config.js**:
```javascript
require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: '0.8.19',
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 84532,
    },
    baseMainnet: {
      url: process.env.BASE_MAINNET_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 8453,
    },
  },
};
```

### Step 3: Deploy Script

**scripts/deploy.js**:
```javascript
const hre = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 Deploying ThreviaToken...');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);

  // Deploy contract
  const ThreviaToken = await hre.ethers.getContractFactory('ThreviaToken');
  const contract = await ThreviaToken.deploy();
  await contract.waitForDeployment();

  const deploymentAddress = await contract.getAddress();
  console.log(`✅ ThreviaToken deployed to: ${deploymentAddress}`);

  // Save deployment info
  const deploymentInfo = {
    contract: 'ThreviaToken',
    network: hre.network.name,
    address: deploymentAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment saved to deployments/${hre.network.name}.json`);

  // Verify deployment
  const totalSupply = await contract.totalSupply();
  console.log(`📊 Total Supply: ${hre.ethers.formatUnits(totalSupply, 18)} THREV`);

  return deploymentAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### Step 4: Run Deployment

```bash
# Testnet (Base Sepolia)
npm run deploy:token

# Mainnet (Base Mainnet)
npm run deploy:token:mainnet
```

---

## Integration with Backend

### API Endpoint for Token Conversion

**routes/token.js**:
```javascript
const express = require('express');
const router = express.Router();
const ethers = require('ethers');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Initialize contract
const THREV_ADDRESS = process.env.THREV_CONTRACT_ADDRESS;
const THREV_ABI = require('../contracts/ThreviaToken.json').abi;
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const signer = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(THREV_ADDRESS, THREV_ABI, signer);

/**
 * POST /api/token/convert
 * Convert user points to THREV tokens
 */
router.post('/convert', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { points } = req.body;

    if (!points || points < 100) {
      return res.status(400).json({
        error: 'Minimum 100 points required for conversion',
      });
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, points, wallet_address FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.wallet_address) {
      return res.status(400).json({
        error: 'No wallet connected. Connect a Base wallet first.',
      });
    }

    if (user.points < points) {
      return res.status(400).json({
        error: `Insufficient points. You have ${user.points}, need ${points}`,
      });
    }

    // Calculate THREV amount (100 points = 1 THREV)
    const threvAmount = points / 100;

    // Call smart contract
    const tx = await contract.convertPointsToThrev(
      user.wallet_address,
      points,
      ethers.parseUnits(threvAmount.toString(), 18)
    );

    const receipt = await tx.wait();

    // Update user points
    const updateResult = await pool.query(
      `UPDATE users 
       SET points = points - $1, threv_balance = threv_balance + $2 
       WHERE id = $3 
       RETURNING points, threv_balance`,
      [points, threvAmount, userId]
    );

    // Log conversion
    await pool.query(
      `INSERT INTO token_conversions 
       (user_id, points_converted, threv_amount, wallet_address, transaction_hash, block_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')`,
      [
        userId,
        points,
        threvAmount,
        user.wallet_address,
        receipt.hash,
        receipt.blockNumber,
      ]
    );

    res.json({
      success: true,
      message: `${threvAmount} THREV tokens minted!`,
      transactionHash: receipt.hash,
      newBalance: updateResult.rows[0].threv_balance,
      remainingPoints: updateResult.rows[0].points,
    });
  } catch (error) {
    console.error('Token conversion error:', error);
    res.status(500).json({ error: 'Token conversion failed' });
  }
});

/**
 * GET /api/token/balance/:walletAddress
 * Get THREV balance for wallet
 */
router.get('/balance/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const balance = await contract.balanceOf(walletAddress);
    const formatted = ethers.formatUnits(balance, 18);

    res.json({
      walletAddress,
      balance: formatted,
      balanceRaw: balance.toString(),
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Failed to check balance' });
  }
});

/**
 * GET /api/token/stats
 * Get token statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalSupply = await contract.totalSupply();
    const formatted = ethers.formatUnits(totalSupply, 18);

    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users_converted,
        SUM(points_converted) as total_points_converted,
        SUM(threv_amount) as total_threv_minted
      FROM token_conversions
      WHERE status = 'confirmed'
    `);

    const stats = statsResult.rows[0];

    res.json({
      totalSupply: formatted,
      usersConverted: parseInt(stats.total_users_converted) || 0,
      totalPointsConverted: parseInt(stats.total_points_converted) || 0,
      totalThrevMinted: parseFloat(stats.total_threv_minted) || 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
```

---

## Base Network Configuration

### RPC Endpoints
```
Testnet (Sepolia):  https://sepolia.base.org
Mainnet:            https://mainnet.base.org
```

### Block Explorers
```
Testnet:  https://sepolia.basescan.org
Mainnet:  https://basescan.org
```

### Common Contracts
```
USDC (Mainnet):     0x833589fCD6eDb6E08f4c7C32D4f71b1310E8E4d
USDC (Sepolia):     0xF175520C5C2934C1d28f88d07bb13C377535f44b
```

---

## Security Considerations

### Access Control
- ✅ Only minters can call `convertPointsToThrev()`
- ✅ Owner can add/remove minters
- ✅ Backend validates points before minting
- ✅ Rate limiting on conversion endpoint

### Frontend Validation
- Check user has enough points
- Verify wallet connection
- Confirm transaction before submission

### Smart Contract Audit
- [ ] Internal security review
- [ ] External audit (Consensys, Certora, etc.)
- [ ] Test all edge cases
- [ ] Before mainnet deployment

---

## Testing

### Local Testing
```bash
# Start local blockchain
npx hardhat node

# In another terminal, run tests
npx hardhat test --network localhost
```

### Testnet Testing
```bash
# Deploy to Base Sepolia
npm run deploy:token

# Check deployment on block explorer
# https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]
```

### User Flow Testing
1. User earns 100 points (from 2 ads)
2. Click "Convert to THREV"
3. System checks points
4. User approves wallet
5. Transaction sent to smart contract
6. THREV appears in wallet
7. Backend logs conversion

---

## Mainnet Launch Checklist

- [ ] Contract audited & security approved
- [ ] Testnet deployment successful & verified
- [ ] All integration tests passing
- [ ] Liquidity pool ready (75,000 THREV)
- [ ] Exchange listings negotiated
- [ ] Marketing plan prepared
- [ ] Community announcement ready
- [ ] Legal review completed (securities, jurisdictions)
- [ ] Emergency pause mechanism tested
- [ ] Gas optimization confirmed
- [ ] Backup minter keys secured
- [ ] Monitoring & alerting setup

---

## Future Enhancements

### Phase 2
- [ ] Staking mechanism (earn APY on THREV)
- [ ] Governance token (vote on features)
- [ ] DAO treasury (community decisions)
- [ ] NFT badges for milestones
- [ ] Bridge to other chains (Ethereum, Polygon)

### Phase 3
- [ ] DEX integration (Uniswap, PancakeSwap)
- [ ] DeFi integration (lending, borrowing)
- [ ] Payment processing (buy data with THREV)
- [ ] Cross-chain compatibility

