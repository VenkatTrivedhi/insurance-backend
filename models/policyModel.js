const mongoose = require("mongoose")


const PolicySchema = mongoose.Schema({
    id: { type: String , required:true},
    customer:{ type: mongoose.SchemaTypes.ObjectId,ref:"user"},
    plan:{ type: mongoose.SchemaTypes.ObjectId,ref:"plan"},
    totalDuration : { type:Number},
    totalInvestment:{type:Number},
    sumAssured:{type:Number},
    termDuration:{type:Number},
    startingDate:{ type:Date},
    maturityDate:{type:Date},
    premiums:{type: [mongoose.SchemaTypes.ObjectId],ref:"premium"},
    isActive:{type:Boolean}
}, {
    timestamps: true
})

let PolicyModel = new mongoose.model('policy', PolicySchema)

module.exports = PolicyModel