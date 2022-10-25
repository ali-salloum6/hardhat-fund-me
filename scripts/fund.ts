import { BigNumber } from "ethers";
import { ethers, getNamedAccounts} from "hardhat";

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract(
        "FundMe",
        deployer
    );
    const fundValue:BigNumber = ethers.utils.parseEther("0.1");
    console.log("Funding contract...");
    const transactionResponse = await fundMe.fund({value: fundValue});
    await transactionResponse.wait(1);
    console.log("Funded!");
    
}

// main
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
