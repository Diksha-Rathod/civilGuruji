const mongoose = require('mongoose')
const Schema = mongoose.Schema

const quizSchema = new Schema({
    // name  : {type : String},
    // questions   : [{type : Schema.Types.ObjectId, ref : "Question"}]

    title: { type: String },
    instructions: { type: String },
    timeLimit: { type: Number }, // default value 0
    retakeAttemps: { type: Number },
    rank: { type: Boolean },
    showSolution: { type: Boolean },
    passingPercentage: { type: Number },
    questions: [{ type: Schema.Types.ObjectId, ref: "QuizQuestion" }]
})

const Quiz = mongoose.model('Quiz', quizSchema)
module.exports = Quiz