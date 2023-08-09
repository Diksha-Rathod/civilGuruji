const { Schema, default: mongoose } = require("mongoose");

const learningRulesSchema = new Schema({
    name: { type: String }
})

const LearningRules = mongoose.model('LearningRules', learningRulesSchema)
module.exports = LearningRules