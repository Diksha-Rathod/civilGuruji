const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userDetailSchema = new Schema({
    name: { type : String},
    email : {type : String, unique: true},
    password: { type: String, required: true },
    recommendations : [{type : Schema.Types.ObjectId, ref: "Course"}],
    username : {type : String, unique : true},
    profile_picture :  {type : String},
    location : {type : String},
    whatsapp_number: { type: String },
    state: { type: String },
    city: { type: String },
    date_of_birth : {type : Date },
    year_of_passing : {type : Number}
})

const UserDetail = mongoose.model('UserDetail', userDetailSchema)
module.exports = UserDetail