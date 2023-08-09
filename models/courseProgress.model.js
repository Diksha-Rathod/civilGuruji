const { Schema, default: mongoose } = require("mongoose");

const subModuleSchema = new Schema({
    subModule: { type: Schema.Types.ObjectId, ref: 'CourseSubContent' },
    isCompleted: { type: Boolean }
})

const questionSchema = new Schema({
    question: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
    answer: { type: Number },
    isAttempted: { type: Boolean }
})

const quizAttemptsSchema = new Schema({
    subModule: { type: Schema.Types.ObjectId, ref: 'CourseSubContent' },
    questions: [questionSchema],
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' }
})

const finalQuizAttemptsData = new Schema({
    questions: [questionSchema],
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' }
})

const courseProgressSchema = new Schema({
    subModules: [subModuleSchema],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    quizAttemps: [quizAttemptsSchema],
    finalQuizAttempts: [finalQuizAttemptsData],
    completedOn: { type: Date }
})

const courseProgress = mongoose.model('courseProgress', courseProgressSchema)

module.exports = courseProgress