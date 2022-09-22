const mongoose = require("mongoose")


const RoleSchema = mongoose.Schema({
    id: { type: String , required:true},
    role: { type: String , unique:true,required:true},
    canCreate :{type:[String]},
    canGet :{type:[String]},
    canUpdate :{type:[String]},
    canDelete :{type:[String]},
}, {
    timestamps: true
})

let RoleModel = new mongoose.model('role', RoleSchema)

module.exports = RoleModel