import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const { username, walletAddress } = req.body;

    const user = await User.create({ username, walletAddress });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};