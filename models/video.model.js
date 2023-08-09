const mongoose = require('mongoose')
const Schema = mongoose.Schema

const videoSchema = new Schema({
    videoUrl : {type : String}
})

const Video = mongoose.model('Video', videoSchema)
module.exports = Video