import { ethers, getNamedAccounts} from "hardhat";

async function main() {
    // const accounts: SignerWithAddress[] = await ethers.getSigners();
    // const deployer: SignerWithAddress = accounts[0];
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract(
        "FundMe",
        deployer
    );
    console.log("Withdrawing from contract...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Got it back!");
}

// main
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
