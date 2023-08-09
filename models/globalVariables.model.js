const { Schema, default: mongoose } = require("mongoose");


const globalVariablesSchema = new Schema({
    learningPercentage: { type: Number }
})

const globalVariables = mongoose.model('globalVariables', globalVariablesSchema)
module.exports = globalVariables