import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";
import { DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    if (chainId == 31337) {
        log("local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mock deployed!");
        log("----------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
