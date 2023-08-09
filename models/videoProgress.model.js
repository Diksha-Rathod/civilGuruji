const { Schema, default: mongoose } = require("mongoose");


const videoProgressSchema = new Schema({
    progress: { type: Number }
})

const videoProgress = mongoose.model('videoProgress', videoProgressSchema)
module.exports = videoProgress