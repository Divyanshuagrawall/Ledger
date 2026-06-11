const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:true,
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:true,
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["Pending", "Completed", "Failed", "Reversed"]
        },
        default:"Pending"
    },
    amount:{
        type:Number,
        required:true,
        min:[0, "Transaction amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:true,
        index:true,
        unique:true
    }
}, {
    timestamps:true
})

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel