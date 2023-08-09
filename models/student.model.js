const { Schema, default: mongoose } = require("mongoose");


const studentSchema = new Schema({
    image: { type: String },
    name: { type: String }
})

const Student = mongoose.model('Student', studentSchema)
module.exports = Student