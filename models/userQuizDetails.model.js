const { Schema, default: mongoose } = require("mongoose");


const userQuizDetailsSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    quizAnswers: {
        quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
        answers: [{
          answer: { type: String },
          isCorrect: { type: Boolean },
          answerdAt: {  type: Timestamp }  
        }]
    }
}, { timestamps: true })

const userQuizDetails = mongoose.model('userQuizDetails', userQuizDetailsSchema)
module.exports = userQuizDetails