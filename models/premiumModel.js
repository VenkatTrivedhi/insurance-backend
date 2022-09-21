const mongoose = require("mongoose")


const PremiumSchema = mongoose.Schema({
    id: { type: String , required:true},
    tobePaidAt: { type:Date},
    paidAt:{type:Date},
    amount:{type:Number},
    status:{type:String},
    transactions:{ type: [mongoose.SchemaTypes.ObjectId],ref:"transaction"}
}, {
    timestamps: true
})

let PremiumModel = new mongoose.model('premium', PremiumSchema)

module.exports = PremiumModel