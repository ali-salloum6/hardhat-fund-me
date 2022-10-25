import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function() {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;
          let mockV3Aggregator: MockV3Aggregator;
          const sendValue: BigNumber = ethers.utils.parseEther("1");

          this.beforeEach(async function() {
              const accounts: SignerWithAddress[] = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", function() {
              it("sets the aggregator contract correctly", async function() {
                  const response: Address = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", function() {
              it("fails if you don't send enough ETH", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });

              it("updated the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue });
                  const amountStored: BigNumber = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  );
                  assert.equal(amountStored.toString(), sendValue.toString());
              });

              it("adds funder to funders array", async function() {
                  await fundMe.fund({ value: sendValue });
                  const funderZero: Address = await fundMe.getFunders(0);
                  assert.equal(funderZero, deployer.address);
              });
          });

          describe("withdraw", function() {
              this.beforeEach(async function() {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single funder", async function() {
                  //arrange
                  const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //act
                  const transactionResponse: ContractTransaction = await fundMe.withdraw();
                  const transactionReceipt: ContractReceipt = await transactionResponse.wait(
                      1
                  );

                  const {
                      gasUsed,
                      effectiveGasPrice
                  }: {
                      gasUsed: BigNumber;
                      effectiveGasPrice: BigNumber;
                  } = transactionReceipt;
                  const gasCost: BigNumber = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //assert
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  assert.equal(endingFundMeBalance.toString(), "0");
              });

              it("Cheaper Withdraw ETH from a single funder", async function() {
                  //arrange
                  const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //act
                  const transactionResponse: ContractTransaction = await fundMe.cheaperWithdraw();
                  const transactionReceipt: ContractReceipt = await transactionResponse.wait(
                      1
                  );

                  const {
                      gasUsed,
                      effectiveGasPrice
                  }: {
                      gasUsed: BigNumber;
                      effectiveGasPrice: BigNumber;
                  } = transactionReceipt;
                  const gasCost: BigNumber = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //assert
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  assert.equal(endingFundMeBalance.toString(), "0");
              });

              it("Withdraw ETH from multiple funders", async function() {
                  const accounts: SignerWithAddress[] = await ethers.getSigners();

                  for (let i: number = 1; i < 6; i++) {
                      const fundMeConnectedContract: FundMe = fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //act
                  const transactionResponse: ContractTransaction = await fundMe.withdraw();
                  const transactionReceipt: ContractReceipt = await transactionResponse.wait(
                      1
                  );

                  const {
                      gasUsed,
                      effectiveGasPrice
                  }: {
                      gasUsed: BigNumber;
                      effectiveGasPrice: BigNumber;
                  } = transactionReceipt;
                  const gasCost: BigNumber = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(
                      deployer.address
                  );
                  //assert
                  for (let i: number = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              )
                          ).toString(),
                          "0"
                      );
                  }
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  assert.equal(endingFundMeBalance.toString(), "0");
                  await expect(fundMe.getFunders(0)).to.be.reverted;
              });

              it("only allows the owner to withdraw", async function() {
                  const accounts: SignerWithAddress[] = await ethers.getSigners();
                  const fundMeConnectedContract: FundMe = fundMe.connect(
                      accounts[1]
                  );

                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
      });
