const mongoose = require("mongoose")
        

const UserSchema = mongoose.Schema({
    id: { type: String , required:true},
    firstName : { type: String , required:true}, 
    lastName : { type: String },
    fullName : { type: String , required:true},
    Dob : { type: String },
    credential : { type:mongoose.SchemaTypes.ObjectId,ref:"credential",unique:true,required:true},
    role: { type: mongoose.SchemaTypes.ObjectId,ref:"role" },
    email: { type: String},
    address: { type: String},
    isActive: { type: Boolean},
    state : { type: mongoose.SchemaTypes.ObjectId,ref:"state" },
    city : { type: mongoose.SchemaTypes.ObjectId,ref:"city" },
    pincode : { type: Number},
    mobileNumber:{type:Number},
    documents:{ type: [mongoose.SchemaTypes.ObjectId],ref:"document" },
    status:{type:String},
    nominee:{type:String}, 
    nomineeRelation:{type:String},
    referenceID:{type:String},
    referedBy:{ type: mongoose.SchemaTypes.ObjectId,ref:"user"},
    customers:{ type: [mongoose.SchemaTypes.ObjectId],ref:"user" },
    qualification:{type:String},
    commission:{type:Number}
}, {
    timestamps: true
})

let UserModel = new mongoose.model('user', UserSchema)

module.exports = UserModel