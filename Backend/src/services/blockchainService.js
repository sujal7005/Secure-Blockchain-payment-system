import contract from "../blockchain/contract.js";

export const getBalance = async (address) => {
  const balance = await contract.balanceOf(address);
  return balance.toString();
};

export const sendTokens = async (to, amount) => {
  const tx = await contract.transfer(to, amount);
  await tx.wait();
  return tx.hash;
};