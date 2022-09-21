const mongoose = require("mongoose")


const TransactionSchema = mongoose.Schema({
    id: { type: String , required:true},
    cardNumber:{type:Number},
    cvv:{type:Number},
    amount:{type:Number},
    doneAt:{type:Date},
    status:{type:String},
}, {
    timestamps: true
})

let TransactionModel = new mongoose.model('transaction', TransactionSchema)

module.exports = TransactionModel