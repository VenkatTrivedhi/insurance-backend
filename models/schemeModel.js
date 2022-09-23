const mongoose = require("mongoose")


const SchemeSchema = mongoose.Schema({
    id: { type: String , required:true},
    image :{
        data: Buffer,
        contentType: String
    },
    imagePath:{type:String},
    type: { type: mongoose.SchemaTypes.ObjectId,ref:"planType"},
    agentCommission:{type:Number},
    notes:{type:String},
    isActive:{type:Boolean},
    plans :{ type: [mongoose.SchemaTypes.ObjectId],ref:"plan"},
}, {
    timestamps: true
})

let SchemeModel = new mongoose.model('scheme', SchemeSchema)

module.exports = SchemeModel