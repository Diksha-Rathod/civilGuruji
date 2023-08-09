const mongoose = require('mongoose')
const Schema = mongoose.Schema

const otpSchema = new Schema({
    userId : {type : Schema.Types.ObjectId, ref : "User"},
    otp : {type : String}
},
{
  timestamps: true
});

const OTP = mongoose.model('OTP', otpSchema)
module.exports = OTP