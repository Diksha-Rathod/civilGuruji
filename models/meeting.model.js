const { Schema, default: mongoose } = require("mongoose");


const meetingSchema = new Schema({
    uuid: { type: String },
    id: { type: String },
    host_email: { type: String },
    topic: { type: String },
    type: { type: Number },
    start_time: { type: String },
    start_url: { type: String },
    join_url: { type: String },
    password: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    isEnded: { type: Boolean, default: false }
})

const meeting = mongoose.model('Meeting', meetingSchema)
module.exports = meeting