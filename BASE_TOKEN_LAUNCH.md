# Base Token Launch Steps (THREV)

This repo is now set up for Hardhat CommonJS in an ESM project (`hardhat.config.cjs`, `scripts/*.cjs`).

## 1. Set environment variables

Create `.env` at project root:

```env
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY
```

## 2. Compile contract

```bash
npx hardhat compile
```

## 3. Deploy to Base Sepolia (testnet)

```bash
npm run deploy:token
```

## 4. Mint test THREV on Base Sepolia

```bash
npx hardhat run scripts/mint.cjs --network baseSepolia <TOKEN_ADDRESS> <AMOUNT>
```

Example:

```bash
npx hardhat run scripts/mint.cjs --network baseSepolia 0xabc123... 1000
```

## 5. Deploy to Base Mainnet (production)

```bash
npm run deploy:token:mainnet
```

## 6. Wire token address into app/backend

- Frontend: `VITE_THREVIA_TOKEN_ADDRESS`
- Backend: `THREVIA_TOKEN_ADDRESS`

## Notes

- Hardhat warns on Node.js v25.x. Use Node 20 LTS for production deployments.
- Keep deployer key in a secure wallet and rotate after launch.
