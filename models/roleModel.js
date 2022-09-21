const mongoose = require("mongoose")


const RoleSchema = mongoose.Schema({
    id: { type: String , required:true},
    role: { type: String , unique:true,required:true},
    rolesThatCanBeCreated :{type:[String]},
    rolesThatCanBeGet :{type:[String]},
}, {
    timestamps: true
})

let RoleModel = new mongoose.model('role', RoleSchema)

module.exports = RoleModel