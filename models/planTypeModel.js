const mongoose = require("mongoose")


const PlanTypeSchema = mongoose.Schema({
    id: { type: String , required:true},
    title: { type: String , unique:true,required:true},
    isActive: {type:Boolean},
}, {
    timestamps: true
})

let PlanTypeModel = new mongoose.model('planType', PlanTypeSchema)

module.exports = PlanTypeModel