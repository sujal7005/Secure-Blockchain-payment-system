import express from "express";
import {
  checkBalance,
  transferTokens
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/balance/:address", checkBalance);
router.post("/transfer", transferTokens);

export default router;