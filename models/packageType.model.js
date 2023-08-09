const { Schema, default: mongoose } = require("mongoose");

const packageTypeSchema = new Schema({
    name: {type: String}
})

const packageType = mongoose.model('packageType', packageTypeSchema)
module.exports = packageType