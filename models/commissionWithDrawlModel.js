const mongoose = require("mongoose")

const CommissionWithDrawlSchema = mongoose.Schema({
    id: { type: String , required:true},
    agent : { type: mongoose.SchemaTypes.ObjectId,ref:"user"},
    doneAt : {type:Date},
    amount :{type:Number} ,
}, {
    timestamps: true
})

let CommissionWithDrawlModel = new mongoose.model('commissionWithDrawl', CommissionWithDrawlSchema)

module.exports = CommissionWithDrawlModel