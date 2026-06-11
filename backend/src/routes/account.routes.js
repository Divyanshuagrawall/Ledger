const express = require("express");
const {authmiddleware} = require("../middlewares/auth.middleware"); 
const {createAccountController, getUserAccountController, getAccountBalanceController} = require("../controllers/account.controller");
const router = express.Router();


router.post("/", authmiddleware, createAccountController);
router.get("/", authmiddleware, getUserAccountController);
router.get("/balance/:accountId", authmiddleware, getAccountBalanceController);
module.exports = router;