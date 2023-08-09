const mongoose = require('mongoose')
const Schema = mongoose.Schema

const questionSchema = new Schema({
    question : {type : String},
    options : [{type : String}],
    correct_ans : [{type : String}]
})

const Question = mongoose.model('Question', questionSchema)
module.exports = Question