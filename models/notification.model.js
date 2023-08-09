const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificationSchema = new Schema({
    userId : {type : Schema.Types.ObjectId, ref : "User"},
    image : {type : String},
    link : {type : String},
    text : {type : String},
    read : {type : Boolean}
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification