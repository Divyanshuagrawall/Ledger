const userModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "incomplete credentials"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!fromUserAccount && !toUserAccount) {
        return res.status(400).json({
            message: "From or To account doesnt exists"
        })
    }

    const alreadyexists = await transactionModel.findOne({
        idempotencyKey
    })

    if (alreadyexists) {
        if (alreadyexists.status === "Completed") {
            return res.status(200).json({
                message: "transaction already proccessed"
            })
        }
        if (alreadyexists.status === "Pending") {
            return res.status(200).json({
                message: "transaction is processing"
            })
        }
        if (alreadyexists.status === "Failed") {
            return res.status(500).json({
                message: "transaction failed due to some issue"
            })
        }
        if (alreadyexists.status === "Reversed") {
            return res.status(200).json({
                message: "transaction already reversed"
            })
        }

        if (toUserAccount.status !== "Active" || fromUserAccount.status !== "Active") {
            return res.status(401).json({
                message: "account status is invalid"
            })
        }

        const balance = await fromUserAccount.getBalance();
        if (balance < amount) {
            return res.status(400).json({
                message: "insufficient balance"
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "Pending"
        }, { session })

        const debitLedgerEntry = await ledgerModel.create({
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "Debit"
        }, { session })

        const creditLedgerEntry = await ledgerModel.create({
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "Credit"
        }, { session })

        transaction.status = "Completed";
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: "transaction completed successfully"
        })
    }
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "five all required credentials"
        })
    }
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }
    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "Pending"
    }, { session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "Debit"
    }, { session })

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "Credit"
    }, { session })

    transaction.status = "Completed"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message:"Initial funds transaction done successfully"
    })
}

module.exports = { createTransaction , createInitialFundsTransaction};