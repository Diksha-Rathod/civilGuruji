const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
    userId : {type : String},
    rating : { type : Number , enum : [0, 0.5, 1, 1.5, 2, 2.5, 3, 3,5, 4, 4.5, 5], required : true},
    text : {type : String}
})

const Feedback = mongoose.model('Feedback', feedbackSchema)
module.exports = Feedback