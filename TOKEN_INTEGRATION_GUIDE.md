# Threvia Token Integration Guide

## Overview

Threvia Bucks is an ERC-20 token on Base that represents in-app currency earned through health engagement. Users can:
- **Earn Bucks**: Complete health modules, answer questions, engage with content
- **Spend Bucks**: Purchase data packages (500MB - Unlimited)
- **Trade**: Send/receive Bucks with other users
- **Redeem**: Convert to other cryptocurrencies via DEX

## Smart Contract Deployment

### Contract Details
- **Name**: Threvia Token
- **Symbol**: THREV
- **Decimals**: 18
- **Chain**: Base (0x2105)
- **Standard**: ERC-20

### Contract Location
- **File**: `contracts/ThreviaToken.sol`
- **Features**:
  - Minting capability (controlled by owner)
  - Burning capability (users can burn their tokens)
  - Transfer & approval standard ERC-20 functions
  - Access control (minter management)

## Deployment Steps

### Option 1: Using Foundry (Recommended)
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create foundry project
forge init --no-git

# Copy contract to src/
cp contracts/ThreviaToken.sol src/

# Deploy to Base Mainnet
forge create src/ThreviaToken.sol:ThreviaToken \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY
```

### Option 2: Using Remix IDE
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `ThreviaToken.sol`
3. Copy contract code from `contracts/ThreviaToken.sol`
4. Select Solidity Compiler (0.8.19+)
5. Deploy to Base using MetaMask

### Option 3: Using thirdweb
```bash
npx thirdweb create --contract

# Select deployment chain: Base
# Follow the thirdweb deployment wizard
```

## Frontend Integration

### Using the Token in React

```javascript
import { useContract, useContractRead } from '@thirdweb-dev/react';

// Get token balance
const { contract } = useContract('YOUR_TOKEN_ADDRESS');
const { data: balance } = useContractRead(contract, 'balanceOf', [userAddress]);

// Mint tokens
const { mutate: mint } = useContractWrite(contract, 'mint');
mint([userAddress, ethers.utils.parseEther('100')]);

// Burn tokens
const { mutate: burn } = useContractWrite(contract, 'burn');
burn([ethers.utils.parseEther('50')]);
```

### Using Viem (Our Current Stack)

```javascript
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const walletClient = createWalletClient({
  chain: base,
  transport: http(),
});

// Read balance
const balance = await publicClient.readContract({
  address: '0xYourTokenAddress',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: [userAddress],
});

// Mint tokens
const hash = await walletClient.writeContract({
  address: '0xYourTokenAddress',
  abi: ERC20_ABI,
  functionName: 'mint',
  args: [userAddress, parseEther('100')],
});
```

## Data Purchase with Tokens

### How It Works

1. **User earns Bucks**: Through engagement with health modules
2. **User selects package**: 500MB, 2GB, 5GB, or Unlimited
3. **Choose payment**: USDC or Threvia Bucks
4. **Spend tokens**: Balance is updated in real-time
5. **Activate data**: Package is immediately available

### Data Packages

| Package | Size | USDC | Threvia Bucks | Duration |
|---------|------|------|---------------|----------|
| Small | 500MB | $2.50 | 250 | 30 days |
| Medium | 2GB | $8.00 | 800 | 30 days |
| Large | 5GB | $18.00 | 1800 | 60 days |
| Premium | Unlimited | $50.00 | 5000 | 30 days |

## Environment Variables

Add to your `.env.local`:

```env
# Token Contract
VITE_THREVIA_TOKEN_ADDRESS=0xYourTokenAddressHere

# Base RPC
VITE_BASE_RPC_URL=https://mainnet.base.org

# Payment Wallet (receives USDC payments)
VITE_PAYMENT_WALLET=0xYourPaymentWalletAddress
```

## Minting Strategy

### Earning Rates

Users earn Threvia Bucks at these rates:

- **Module engagement**: 10 bucks per module switch
- **Health keywords**: 15 bucks per message with health-related content
- **Bookmark click**: 5 bucks per resource access
- **Base Pay donation**: Bonus 100 bucks per $5 donation

### Daily Caps

- Maximum 200 bucks per 25-minute session
- Maximum 500 bucks per day
- Prevents abuse while rewarding engagement

## Security Considerations

### Best Practices

1. **Private Key Management**
   - Never commit private keys to git
   - Use environment variables
   - Consider using hardware wallet for deployment

2. **Access Control**
   - Only app backend should be a minter
   - Remove minter rights after tests
   - Implement rate limiting on mint calls

3. **Token Safety**
   - Use OpenZeppelin contracts in production
   - Consider adding pausable functionality
   - Implement upgrade mechanism

### Testnet Deployment

Test on Base Sepolia first:

```bash
# Deploy to Base Sepolia
forge create src/ThreviaToken.sol:ThreviaToken \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

## Integration Checklist

- [ ] Deploy token contract to Base
- [ ] Add token address to environment variables
- [ ] Update payment wallet address
- [ ] Test token minting in frontend
- [ ] Test token burning
- [ ] Test data purchase with Bucks
- [ ] Test data purchase with USDC
- [ ] Set up token in DEX (Uniswap, etc.)
- [ ] Create token documentation
- [ ] Deploy to production

## Useful Resources

- [Base Documentation](https://docs.base.org)
- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [Viem Documentation](https://viem.sh)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## Support

For questions or issues:
- Email: support@threvia.app
- Discord: https://discord.gg/threvia
- GitHub Issues: https://github.com/MacZondi/Threvia-app/issues
