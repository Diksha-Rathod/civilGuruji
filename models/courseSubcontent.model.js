const mongoose = require('mongoose')
const Schema = mongoose.Schema

const attachmentsSchema = new Schema({
    label: String,
    data: String
})

const courseSubContentSchema = new Schema({
    index: {type: Number},
    name : {type: String},
    views : {type : String },
    comments : {type : Schema.Types.ObjectId, ref : 'Comment'},
    thumbnail : {type : String},
    description : { type: String },
    video : {type : Schema.Types.ObjectId, ref : 'Video'},
    type: {type: Number},
    videoUrl: {type: String},
    documentUrl: {type: String},
    url: { type: String },
    modelUrl: { type: String },
    downloadable: { type: Schema.Types.Boolean },
    duration: {
        DD: {type: Number},
        HH: {type: Number},
        MM: {type: Number}
    },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    attachments: [attachmentsSchema]
})

const CourseSubContent = mongoose.model('CourseSubContent', courseSubContentSchema)
module.exports = CourseSubContent