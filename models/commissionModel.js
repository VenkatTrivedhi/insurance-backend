const mongoose = require("mongoose")

const CommissionSchema = mongoose.Schema({
    id: { type: String , required:true},
    policy: { type: mongoose.SchemaTypes.ObjectId,ref:"policy"},
    agent : { type: mongoose.SchemaTypes.ObjectId,ref:"user"},
    date : {type:Date},
    customer : {type: mongoose.SchemaTypes.ObjectId,ref:"user"},
    scheme : {type: mongoose.SchemaTypes.ObjectId,ref:"scheme"},
    amount :{type:Number}  
}, {
    timestamps: true
})

let CommissionModel = new mongoose.model('commission', CommissionSchema)

module.exports = CommissionModel