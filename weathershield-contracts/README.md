# WeatherShield Smart Contracts

This project contains the smart contracts for the WeatherShield parametric crop insurance dApp.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add the following, replacing `YOUR_PRIVATE_KEY` with your own private key:
    ```
    CELO_ALFAJORES_RPC_URL="https://alfajores-forno.celo-testnet.org"
    PRIVATE_KEY="YOUR_PRIVATE_KEY"
    CUSD_TOKEN_ADDRESS="0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
    ```

## Compile

To compile the smart contracts, run the following command:

```bash
npx hardhat compile
```

## Deploy

To deploy the smart contracts to the Celo Alfajores test network, run the following command:

```bash
npx hardhat run scripts/deployAll.js --network alfajores
```

## Verify

To verify the smart contracts on the Celo Explorer, you will need to use the Hardhat Etherscan plugin. The configuration for this is not included in the `hardhat.config.js` file, but can be added if needed.
# CeloShield
