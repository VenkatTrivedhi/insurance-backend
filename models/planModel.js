const mongoose = require("mongoose")


const PlanSchema = mongoose.Schema({
    id: { type: String , required:true},
    type: { type: mongoose.SchemaTypes.ObjectId,ref:"planType"},
    scheme : { type: mongoose.SchemaTypes.ObjectId,ref:"scheme"},
    minimumTerm:{type:Number},
    maximumTerm:{type:Number},
    maximumAge:{type:Number},
    minimumAge:{type:Number},
    minimumInvestment:{type:Number},
    maximumInvestment:{type:Number},
    profitRatio:{type:Number}, 
    isActive:{type:Boolean}    
}, {
    timestamps: true
})

let PlanModel = new mongoose.model('plan', PlanSchema)

module.exports = PlanModel