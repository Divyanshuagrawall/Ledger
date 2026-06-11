const express = require("express");
const router = express.Router();
const {authmiddleware, authSystemUsermiddleware} = require("../middlewares/auth.middleware");
const {createTransaction, createInitialFundsTransaction} = require("../controllers/transaction.controllers");

router.post("/", authmiddleware, createTransaction);
router.post("/system/initial-funds", authSystemUsermiddleware, createInitialFundsTransaction);

module.exports = router;