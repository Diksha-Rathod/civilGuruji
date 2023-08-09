const { Schema, default: mongoose } = require("mongoose");


const crackJobSchema = new Schema({
    value: { type: String },
    index: { type: Number }
})

const CrackJob = mongoose.model('CrackJob', crackJobSchema)
module.exports = CrackJob