const mongoose = require("mongoose")


const CitySchema = mongoose.Schema({
    id: { type: String , required:true},
    name:{type:String}
}, {
    timestamps: true
})

let CityModel = new mongoose.model('city', CitySchema)

module.exports = CityModel