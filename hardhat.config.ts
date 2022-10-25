import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const CMC_API_KEY = process.env.CMC_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
    },
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: CMC_API_KEY,
        token: "ETH"
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    }
};

export default config;
