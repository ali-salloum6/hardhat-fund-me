import { verify } from "../utils/verify";
import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig } from "../helper-hardhat-config";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    let ethUsdPriceFeedAddress: string;
    if (chainId == 31337) {
        const ethUsdPriceFeed = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdPriceFeed.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]!;
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId]?.blockConfirmations! || 0,
    });

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }
};

module.exports.tags = ["all", "fundMe"];
