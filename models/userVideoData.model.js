const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userVideoDataSchema = new Schema({
    userId : {type : Schema.Types.ObjectId, ref : "User"},
    videoId : {type : Schema.Types.ObjectId, ref : "Video"},
    
})

const UserVideoData = mongoose.model('UserVideoData', userVideoDataSchema)
module.exports = UserVideoData