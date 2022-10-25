import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";
import { FundMe } from "../../typechain-types";
import { developmentChains } from "../../helper-hardhat-config";
import { assert } from "chai";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function() {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;
          const sendValue: BigNumber = ethers.utils.parseEther("0.1");

          this.beforeEach(async function() {
              const accounts: SignerWithAddress[] = await ethers.getSigners();
              deployer = accounts[0];
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function() {
            await fundMe.fund({value: sendValue});
            await fundMe.withdraw();
            const endingBalance:BigNumber = await fundMe.provider.getBalance(
                fundMe.address
            );
            assert(endingBalance.toString(), "0");
          });
      });
