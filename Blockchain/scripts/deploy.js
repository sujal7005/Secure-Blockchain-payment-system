import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log("Token deployed to:", await token.getAddress());

  const Data = await ethers.getContractFactory("DataOwnership");
  const data = await Data.deploy();
  await data.waitForDeployment();

  console.log("Data contract deployed to:", await data.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});