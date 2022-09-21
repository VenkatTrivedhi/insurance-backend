const mongoose = require("mongoose")


const StateSchema = mongoose.Schema({
    id: { type: String , required:true},
    name:{type:String},
    cities :{ type: [mongoose.SchemaTypes.ObjectId],ref:"city" },
    plans :{ type: [mongoose.SchemaTypes.ObjectId],ref:"plan" },
}, {
    timestamps: true
})

let StateModel = new mongoose.model('state', StateSchema)

module.exports = StateModel