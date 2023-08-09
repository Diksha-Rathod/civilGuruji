const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    phoneNumber: { type: String, required: true },
    userDetail : { type : Schema.Types.ObjectId, ref: 'UserDetail'},
    userActivity: [{ type : Schema.Types.ObjectId, ref: 'UserActivity' }],
    roles : [{ type: mongoose.Schema.Types.ObjectId,ref: "Role"}],
    purchases : [{type : Schema.Types.ObjectId, ref: 'Purchases'}],
    userQuizDetail: [{ type: Schema.Types.ObjectId, ref: 'userQuizDetails' }],
    hearAbout: { type: String }
})

const User = mongoose.model('User', userSchema)
module.exports = User