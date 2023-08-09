const { Schema, default: mongoose } = require("mongoose");


const courseCategorySchema = new Schema({
    name: { type: String, unique: true },
    priority: { type: Number, required: true }
})


const courseCategory = mongoose.model('CourseCategory', courseCategorySchema)
module.exports = courseCategory