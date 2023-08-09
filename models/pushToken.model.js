const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pushTokenSchema = new Schema({
    userId : {type : Schema.Types.ObjectId, ref : "User"},
    pushToken : {type : String},
    
})

const PushToken = mongoose.model('PushToken', pushTokenSchema)
module.exports = PushToken