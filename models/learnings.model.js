const { Schema, default: mongoose } = require("mongoose");


const learningsSchema = new Schema({
    value: { type: String },
    index: { type: Number }
})

const Learnings = mongoose.model('Learnings', learningsSchema)
module.exports = Learnings