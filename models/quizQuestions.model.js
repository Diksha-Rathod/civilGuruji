const { Schema, default: mongoose } = require("mongoose");

const quizQuestionSchema = new Schema({
    question: { type: String },
    options: [{ type: String }],
    solution: { type: Number }
})

const quizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema)
module.exports = quizQuestion