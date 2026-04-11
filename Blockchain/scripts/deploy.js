// Blockchain/scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📡 Deploying contracts with account: ${deployer.address}`);
  
  // Get balance correctly for ethers v6
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  // Deploy MyToken
  console.log("\n📄 Deploying MyToken...");
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  await myToken.waitForDeployment();
  
  const myTokenAddress = await myToken.getAddress();
  console.log(`✅ MyToken deployed to: ${myTokenAddress}`);
  
  // Get token info
  const name = await myToken.name();
  const symbol = await myToken.symbol();
  const decimals = await myToken.decimals();
  const totalSupply = await myToken.totalSupply();
  
  // Convert BigInt to string for display
  const totalSupplyFormatted = hre.ethers.formatEther(totalSupply);
  
  console.log(`\n📊 Token Info:`);
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Total Supply: ${totalSupplyFormatted} ${symbol}`);
  
  // Save contract addresses - Convert BigInt to Number/String
  const contractAddresses = {
    MyToken: myTokenAddress,
    name: name,
    symbol: symbol,
    decimals: Number(decimals), // Convert BigInt to Number
    network: "localhost",
    chainId: 1337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    totalSupply: totalSupplyFormatted // Store as string
  };
  
  // Save to file
  const addressesPath = path.join(__dirname, "../contract-address.json");
  fs.writeFileSync(addressesPath, JSON.stringify(contractAddresses, null, 2));
  console.log(`\n💾 Contract address saved to: contract-address.json`);
  
  // Get all accounts for testing
  const accounts = await hre.ethers.getSigners();
  console.log(`\n👥 Available accounts for testing:`);
  for (let i = 0; i < Math.min(accounts.length, 5); i++) {
    const tokenBalance = await myToken.balanceOf(accounts[i].address);
    const tokenBalanceFormatted = hre.ethers.formatEther(tokenBalance);
    console.log(`   Account ${i}: ${accounts[i].address}`);
    console.log(`   Balance: ${tokenBalanceFormatted} ${symbol}\n`);
  }
  
  console.log("\n✨ Deployment completed successfully!");
  console.log("\n🔗 To add token to MetaMask:");
  console.log(`   Token Contract Address: ${myTokenAddress}`);
  console.log(`   Token Symbol: ${symbol}`);
  console.log(`   Token Decimals: ${decimals}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});