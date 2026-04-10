import { getBalance, sendTokens } from "../services/blockchainService.js";

export const checkBalance = async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await getBalance(address);

    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const transferTokens = async (req, res) => {
  try {
    const { to, amount } = req.body;

    const txHash = await sendTokens(to, amount);

    res.json({
      message: "Transaction successful",
      txHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};