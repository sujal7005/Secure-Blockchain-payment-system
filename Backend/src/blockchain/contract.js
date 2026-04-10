import { ethers } from "ethers";
import { wallet } from "./provider.js";

const contractAddress = process.env.CONTRACT_ADDRESS;

const abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

export default contract;