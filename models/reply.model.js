const mongoose = require('mongoose')
const Schema = mongoose.Schema

const replySchema = new Schema({
    commentId :{ type: Schema.Types.ObjectId, ref: 'Comment'},
    userId :{ type: Schema.Types.ObjectId, ref: 'User'},
    text : {type : String},
    replies : [{type: Schema.Types.ObjectId, ref: 'Reply'}],
},{
    timestamps: true
})

const reply = mongoose.model('Reply', replySchema)
module.exports = reply