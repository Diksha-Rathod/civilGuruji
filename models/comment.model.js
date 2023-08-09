const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    userId :{ type: Schema.Types.ObjectId, ref: 'User'},
    text : {type : String},
    subModuleId : {type: Schema.Types.ObjectId, ref: 'CourseSubContent'},
    replies : [{type: Schema.Types.ObjectId, ref: 'Reply'}],
},{
    timestamps: true
})

const comment = mongoose.model('Comment', commentSchema)
module.exports = comment